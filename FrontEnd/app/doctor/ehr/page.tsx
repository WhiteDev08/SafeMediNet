"use client"

import { FileText, Lock, Eye, Share2, Download } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { db, decryptData } from "@/firebase"
import { 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  Timestamp,
  doc,
  getDoc
} from "firebase/firestore"
import { useAuth } from "@/hooks/use-auth"

interface EHRRecord {
  id: string
  patientId: string
  patientName: string
  type: string
  date: string
  status: string
  access: string
  dataEncrypted?: string
}

export default function DoctorEHRPage() {
  const { user } = useAuth()
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [records, setRecords] = useState<EHRRecord[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!user?.id) return
    fetchEHRRecords()
  }, [user?.id])

  const fetchEHRRecords = async () => {
    try {
      // Fetch patients assigned to this doctor
      const patientsQuery = query(
        collection(db, 'patients'),
        where('assignedDoctor', '==', user?.id)
      )
      
      const patientsSnapshot = await getDocs(patientsQuery)
      const recordsData: EHRRecord[] = []

      for (const patientDoc of patientsSnapshot.docs) {
        const patientData = patientDoc.data()
        
        // Get EHR records for this patient
        const ehrQuery = query(
          collection(db, 'ehr_records'),
          where('patientId', '==', patientDoc.id)
        )
        
        const ehrSnapshot = await getDocs(ehrQuery)
        
        ehrSnapshot.forEach((ehrDoc) => {
          const ehrData = ehrDoc.data()
          recordsData.push({
            id: ehrDoc.id,
            patientId: patientDoc.id,
            patientName: patientData.name,
            type: ehrData.type || 'Medical Record',
            date: ehrData.timestamp?.toDate().toLocaleDateString() || 'N/A',
            status: ehrData.status || 'Completed',
            access: ehrData.accessLevel || 'Full',
            dataEncrypted: ehrData.dataEncrypted
          })
        })
      }

      setRecords(recordsData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching EHR records:', error)
      setLoading(false)
    }
  }

  const handleViewRecord = async (record: EHRRecord) => {
    try {
      // Log access
      await addDoc(collection(db, 'audit_logs'), {
        userId: user?.id,
        userName: user?.name,
        action: 'EHR_VIEW',
        targetType: 'ehr_record',
        targetId: record.id,
        patientId: record.patientId,
        patientName: record.patientName,
        timestamp: Timestamp.now(),
        ipAddress: 'N/A',
        userAgent: navigator.userAgent,
        status: 'Success'
      })

      // Decrypt and view record
      if (record.dataEncrypted) {
        const decryptedData = decryptData(record.dataEncrypted)
        alert(`Viewing record: ${JSON.stringify(decryptedData, null, 2)}`)
      } else {
        alert(`Viewing full record for ${record.patientName}`)
      }
    } catch (error) {
      console.error('Error viewing record:', error)
      alert('Failed to view record')
    }
  }

  const handleDownload = async (record: EHRRecord) => {
    try {
      // Log download
      await addDoc(collection(db, 'audit_logs'), {
        userId: user?.id,
        userName: user?.name,
        action: 'EHR_DOWNLOAD',
        targetType: 'ehr_record',
        targetId: record.id,
        patientId: record.patientId,
        patientName: record.patientName,
        timestamp: Timestamp.now(),
        ipAddress: 'N/A',
        userAgent: navigator.userAgent,
        status: 'Success'
      })

      alert(`Downloaded ${record.type} for ${record.patientName}`)
    } catch (error) {
      console.error('Error downloading record:', error)
    }
  }

  const handleShareAccess = async (email: string, accessLevel: string) => {
    try {
      const record = records.find(r => r.id === selectedRecord)
      if (!record) return

      await addDoc(collection(db, 'shared_access'), {
        recordId: selectedRecord,
        patientId: record.patientId,
        sharedBy: user?.id,
        sharedWith: email,
        accessLevel: accessLevel,
        timestamp: Timestamp.now(),
        expiresAt: null
      })

      // Log sharing
      await addDoc(collection(db, 'audit_logs'), {
        userId: user?.id,
        action: 'EHR_SHARE',
        targetType: 'ehr_record',
        targetId: selectedRecord,
        sharedWith: email,
        accessLevel: accessLevel,
        timestamp: Timestamp.now()
      })

      setShowShareModal(false)
      alert('Access shared successfully!')
    } catch (error) {
      console.error('Error sharing access:', error)
      alert('Failed to share access')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-secondary">Loading EHR records...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Electronic Health Records</h1>
        <p className="mt-2 text-secondary">Manage and access patient EHR with privacy controls</p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Records List */}
        <div className="card p-6 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Patient Records</h2>
          </div>

          <div className="space-y-3">
            {records.length === 0 ? (
              <p className="text-secondary text-center py-8">No records found</p>
            ) : (
              records.map((record) => (
                <div
                  key={record.id}
                  onClick={() => setSelectedRecord(record.id)}
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                    selectedRecord === record.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-surface-alt"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-foreground">{record.patientName}</h3>
                      </div>
                      <p className="mt-1 text-sm text-secondary">{record.type}</p>
                      <div className="mt-2 flex gap-2">
                        <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          {record.status}
                        </span>
                        <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          {record.access} Access
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-secondary">{record.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Record Details & Actions */}
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Record Details</h2>

          {selectedRecord ? (
            <div className="space-y-4">
              {records
                .filter((r) => r.id === selectedRecord)
                .map((record) => (
                  <div key={record.id}>
                    <div className="mb-4 rounded-lg bg-surface-alt p-4">
                      <p className="text-xs text-secondary">Patient</p>
                      <p className="font-semibold text-foreground">{record.patientName}</p>
                      <p className="mt-2 text-xs text-secondary">Record Type</p>
                      <p className="font-semibold text-foreground">{record.type}</p>
                      <p className="mt-2 text-xs text-secondary">Date</p>
                      <p className="font-semibold text-foreground">{record.date}</p>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleViewRecord(record)}
                        className="flex w-full items-center gap-2 rounded-lg bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition-all duration-200 hover:bg-blue-100"
                      >
                        <Eye className="h-4 w-4" />
                        View Full Record
                      </button>
                      <button
                        onClick={() => handleDownload(record)}
                        className="flex w-full items-center gap-2 rounded-lg bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 transition-all duration-200 hover:bg-green-100"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="flex w-full items-center gap-2 rounded-lg bg-purple-50 px-4 py-2.5 text-sm font-medium text-purple-700 transition-all duration-200 hover:bg-purple-100"
                      >
                        <Share2 className="h-4 w-4" />
                        Share Access
                      </button>
                      <button
                        onClick={() => router.push("/patient/access-control")}
                        className="flex w-full items-center gap-2 rounded-lg bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-700 transition-all duration-200 hover:bg-orange-100"
                      >
                        <Lock className="h-4 w-4" />
                        Access Control
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-center">
              <p className="text-secondary">Select a record to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Access Control Info */}
      <div className="mt-8 card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Privacy & Access Control</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-4">
            <Lock className="mb-2 h-6 w-6 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Encryption</h3>
            <p className="mt-1 text-sm text-blue-700">All records encrypted end-to-end</p>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <Eye className="mb-2 h-6 w-6 text-green-600" />
            <h3 className="font-semibold text-green-900">Audit Logs</h3>
            <p className="mt-1 text-sm text-green-700">Track all access and modifications</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-4">
            <Share2 className="mb-2 h-6 w-6 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Granular Control</h3>
            <p className="mt-1 text-sm text-purple-700">Fine-grained access permissions</p>
          </div>
        </div>
      </div>

      {/* Share Access Modal */}
      {showShareModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="card p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground">Share Record Access</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              handleShareAccess(
                formData.get('email') as string,
                formData.get('accessLevel') as string
              )
            }}>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Doctor Email</label>
                  <input 
                    type="email" 
                    name="email"
                    placeholder="doctor@example.com" 
                    className="input-field" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Access Level</label>
                  <select name="accessLevel" className="input-field" required>
                    <option value="Full">Full Access</option>
                    <option value="Limited">Limited Access</option>
                    <option value="View Only">View Only</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowShareModal(false)} 
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    Share
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}