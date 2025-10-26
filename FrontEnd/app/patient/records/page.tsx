"use client"

import { FileText, Lock, Calendar, User, Loader2, Download } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { db } from "@/firebase"
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore"

interface MedicalRecord {
  id: string
  type: string
  date: string
  doctorName: string
  doctorId: string
  status: string
  description: string
  notes?: string
  timestamp: number
}

export default function PatientRecordsPage() {
  const { user } = useAuth()
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null)
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    if (user?.id) {
      loadMedicalRecords()
    }
  }, [user])

  const loadMedicalRecords = async () => {
    try {
      setLoading(true)
      
      // Load from medical_records collection (if it exists in your schema)
      const recordsQuery = query(
        collection(db, 'medical_records'),
        where('patientId', '==', user!.id),
        orderBy('timestamp', 'desc')
      )
      
      const recordsSnapshot = await getDocs(recordsQuery)
      const recordsList: MedicalRecord[] = []
      
      for (const docSnap of recordsSnapshot.docs) {
        const data = docSnap.data()
        
        // Get doctor name
        let doctorName = data.doctorId || "Unknown Doctor"
        if (data.doctorId) {
          try {
            const doctorRef = doc(db, 'doctors', data.doctorId)
            const doctorDoc = await getDoc(doctorRef)
            if (doctorDoc.exists()) {
              doctorName = doctorDoc.data().name
            }
          } catch (error) {
            console.error("Error fetching doctor:", error)
          }
        }
        
        recordsList.push({
          id: docSnap.id,
          type: data.type || "General Record",
          date: new Date(data.timestamp.toMillis()).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          doctorName,
          doctorId: data.doctorId,
          status: data.status || "Available",
          description: data.description || "No description provided",
          notes: data.notes,
          timestamp: data.timestamp.toMillis()
        })
      }
      
      setRecords(recordsList)
    } catch (error) {
      console.error("Error loading medical records:", error)
      // If medical_records collection doesn't exist, show empty state
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = filterType === 'all' 
    ? records 
    : records.filter(r => r.type === filterType)

  const recordTypes = ['all', ...Array.from(new Set(records.map(r => r.type)))]

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Medical Records</h1>
        <p className="mt-2 text-secondary">View and manage your health information</p>
      </div>

      {/* Filter */}
      {records.length > 0 && (
        <div className="mb-6 flex items-center gap-4">
          <label className="text-sm font-medium text-foreground">Filter by type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {recordTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Records' : type}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Records List */}
      {filteredRecords.length > 0 ? (
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <div key={record.id} className="card overflow-hidden transition-all duration-200">
              <button
                onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                className="w-full px-6 py-4 text-left hover:bg-surface-alt"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-semibold text-foreground">{record.type}</h3>
                        <p className="mt-1 text-sm text-secondary">{record.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{record.status}</p>
                    <p className="text-xs text-secondary">{record.date}</p>
                  </div>
                </div>
              </button>

              {expandedRecord === record.id && (
                <div className="border-t border-border bg-surface-alt px-6 py-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <User className="h-4 w-4 text-secondary" />
                        <span className="text-sm text-secondary">Physician</span>
                      </div>
                      <p className="font-medium text-foreground">{record.doctorName}</p>
                      <p className="text-xs text-secondary">{record.doctorId}</p>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-secondary" />
                        <span className="text-sm text-secondary">Date</span>
                      </div>
                      <p className="font-medium text-foreground">{record.date}</p>
                    </div>
                  </div>

                  {record.notes && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-foreground mb-2">Notes:</p>
                      <p className="text-sm text-secondary">{record.notes}</p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-3">
                    <button className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-all duration-200 hover:bg-blue-100">
                      <FileText className="h-4 w-4" />
                      View Details
                    </button>
                    <button className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition-all duration-200 hover:bg-green-100">
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <FileText className="h-16 w-16 text-secondary mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Medical Records</h3>
          <p className="text-secondary">
            {records.length === 0 
              ? "You don't have any medical records yet. Records will appear here once your healthcare provider adds them."
              : "No records match the selected filter."}
          </p>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
        <div className="flex gap-4">
          <Lock className="h-6 w-6 flex-shrink-0 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900">Your Privacy is Protected</h3>
            <p className="mt-2 text-sm text-blue-700">
              All your medical records are encrypted and protected. You control who can access your information. View
              your access logs anytime to see who has viewed your records.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}