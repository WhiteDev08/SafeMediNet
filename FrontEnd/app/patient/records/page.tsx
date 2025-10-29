"use client"

import { FileText, Lock, Calendar, User, Loader2, Download, Activity, Eye, Heart, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { db, decryptData, VitalsData } from "@/firebase"
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  doc, 
  getDoc,
  addDoc,
  Timestamp 
} from "firebase/firestore"

interface VitalsRecord {
  id: string
  type: 'Vitals Update'
  date: string
  nurseName: string
  nurseId: string
  status: string
  description: string
  vitals: VitalsData
  timestamp: number
  deviceType?: string
}

interface AuditRecord {
  id: string
  type: 'Access Log'
  date: string
  userName: string
  userId: string
  action: string
  status: string
  description: string
  timestamp: number
}

type MedicalRecord = VitalsRecord | AuditRecord

export default function PatientRecordsPage() {
  const { user } = useAuth()
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null)
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      loadMedicalRecords()
    }
  }, [user])

  const loadMedicalRecords = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const recordsList: MedicalRecord[] = []

      // 1. Load Vitals Records from iomt_data collection
      try {
        const vitalsQuery = query(
          collection(db, 'iomt_data'),
          where('patientId', '==', user!.id),
          orderBy('timestamp', 'desc')
        )
        
        const vitalsSnapshot = await getDocs(vitalsQuery)
        
        for (const docSnap of vitalsSnapshot.docs) {
          const data = docSnap.data()
          
          // Get nurse name
          let nurseName = data.nurseId || "System"
          if (data.nurseId && data.nurseId !== 'Manual Update' && data.nurseId !== 'System') {
            try {
              const nurseRef = doc(db, 'nurses', data.nurseId)
              const nurseDoc = await getDoc(nurseRef)
              if (nurseDoc.exists()) {
                nurseName = nurseDoc.data().name || data.nurseId
              }
            } catch (error) {
              console.warn("Error fetching nurse:", error)
            }
          }
          
          // Decrypt vitals data
          let vitals: VitalsData = {
            heartRate: 0,
            systolicBP: 0,
            diastolicBP: 0,
            temperature: 0,
            oxygenSaturation: 0,
            respiratoryRate: 0,
            bloodGlucose: 0,
            weight: 0,
            height: 0
          }
          
          try {
            if (data.parametersEncrypted) {
              vitals = await decryptData(data.parametersEncrypted) as VitalsData
            }
          } catch (decryptError) {
            console.error("Error decrypting vitals:", decryptError)
          }
          
          const timestamp = data.timestamp.toMillis()
          const date = new Date(timestamp)
          
          recordsList.push({
            id: docSnap.id,
            type: 'Vitals Update',
            date: date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            nurseName,
            nurseId: data.nurseId,
            status: 'Completed',
            description: `Vital signs recorded by ${nurseName}`,
            vitals,
            timestamp,
            deviceType: data.deviceType || 'Manual Update'
          })
        }
      } catch (vitalsError) {
        console.warn("Error loading vitals records:", vitalsError)
      }

      // 2. Load Access Audit Logs
      try {
        const auditQuery = query(
          collection(db, 'audit_logs'),
          where('patientId', '==', user!.id),
          orderBy('timestamp', 'desc')
        )
        
        const auditSnapshot = await getDocs(auditQuery)
        
        for (const docSnap of auditSnapshot.docs) {
          const data = docSnap.data()
          
          const timestamp = data.timestamp.toMillis()
          const date = new Date(timestamp)
          
          // Only include relevant actions
          const relevantActions = ['EHR_VIEW', 'VITALS_VIEW', 'VITALS_DOWNLOAD', 'ACCESS_SHARED', 'PATIENT_VIEW']
          if (!relevantActions.includes(data.action)) continue
          
          const actionDescriptions: Record<string, string> = {
            'EHR_VIEW': 'viewed your electronic health record',
            'VITALS_VIEW': 'viewed your vital signs',
            'VITALS_DOWNLOAD': 'downloaded your vitals data',
            'ACCESS_SHARED': 'shared access to your records',
            'PATIENT_VIEW': 'viewed your patient profile'
          }
          
          recordsList.push({
            id: docSnap.id,
            type: 'Access Log',
            date: date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            userName: data.userName || data.userId || 'Unknown User',
            userId: data.userId,
            action: data.action,
            status: data.status || 'Success',
            description: `${data.userName || 'User'} ${actionDescriptions[data.action] || 'accessed your records'}`,
            timestamp
          })
        }
      } catch (auditError) {
        console.warn("Error loading audit logs:", auditError)
      }

      // 3. Sort all records by timestamp (most recent first)
      recordsList.sort((a, b) => b.timestamp - a.timestamp)
      
      console.log(`Loaded ${recordsList.length} records for patient ${user!.id}`)
      setRecords(recordsList)
      
    } catch (error) {
      console.error("Error loading medical records:", error)
      setError("Failed to load medical records. Please try again.")
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = async (record: MedicalRecord) => {
    try {
      // Log view action
      await addDoc(collection(db, 'audit_logs'), {
        userId: user?.id,
        userName: user?.name || 'Patient',
        action: 'RECORD_VIEW',
        targetType: 'medical_record',
        targetId: record.id,
        patientId: user?.id,
        patientName: user?.name,
        timestamp: Timestamp.now(),
        status: 'Success',
        details: `Patient viewed ${record.type} record`
      })

      if (record.type === 'Vitals Update') {
        const vitalsRecord = record as VitalsRecord
        const vitalsDisplay = `
Vitals Update Details
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date: ${vitalsRecord.date}
Updated by: ${vitalsRecord.nurseName}
Device: ${vitalsRecord.deviceType}

Current Vitals:
━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Heart Rate: ${vitalsRecord.vitals.heartRate} bpm
• Blood Pressure: ${vitalsRecord.vitals.systolicBP}/${vitalsRecord.vitals.diastolicBP} mmHg
• Temperature: ${vitalsRecord.vitals.temperature}°F
• Oxygen Saturation: ${vitalsRecord.vitals.oxygenSaturation}%
• Respiratory Rate: ${vitalsRecord.vitals.respiratoryRate} breaths/min
• Blood Glucose: ${vitalsRecord.vitals.bloodGlucose} mg/dL
• Weight: ${vitalsRecord.vitals.weight} kg
• Height: ${vitalsRecord.vitals.height} cm
        `.trim()
        alert(vitalsDisplay)
      } else {
        alert(`Access Log Details\n\n${record.description}\nDate: ${record.date}\nStatus: ${record.status}`)
      }
    } catch (error) {
      console.error('Error viewing record:', error)
    }
  }

  const handleDownload = async (record: MedicalRecord) => {
    try {
      // Log download action
      await addDoc(collection(db, 'audit_logs'), {
        userId: user?.id,
        userName: user?.name || 'Patient',
        action: 'RECORD_DOWNLOAD',
        targetType: 'medical_record',
        targetId: record.id,
        patientId: user?.id,
        patientName: user?.name,
        timestamp: Timestamp.now(),
        status: 'Success',
        details: `Patient downloaded ${record.type} record`
      })

      if (record.type === 'Vitals Update') {
        const vitalsRecord = record as VitalsRecord
        const csvContent = `Vitals Update Record
Patient ID,${user?.id}
Patient Name,${user?.name}
Date,${vitalsRecord.date}
Updated By,${vitalsRecord.nurseName}
Device Type,${vitalsRecord.deviceType}

Vital Sign,Value,Unit
Heart Rate,${vitalsRecord.vitals.heartRate},bpm
Systolic Blood Pressure,${vitalsRecord.vitals.systolicBP},mmHg
Diastolic Blood Pressure,${vitalsRecord.vitals.diastolicBP},mmHg
Temperature,${vitalsRecord.vitals.temperature},°F
Oxygen Saturation,${vitalsRecord.vitals.oxygenSaturation},%
Respiratory Rate,${vitalsRecord.vitals.respiratoryRate},breaths/min
Blood Glucose,${vitalsRecord.vitals.bloodGlucose},mg/dL
Weight,${vitalsRecord.vitals.weight},kg
Height,${vitalsRecord.vitals.height},cm`

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `vitals_${new Date(record.timestamp).getTime()}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        const auditRecord = record as AuditRecord
        const txtContent = `Access Log Record
Patient ID: ${user?.id}
Patient Name: ${user?.name}
Date: ${auditRecord.date}
Action: ${auditRecord.action}
User: ${auditRecord.userName}
Status: ${auditRecord.status}
Description: ${auditRecord.description}`

        const blob = new Blob([txtContent], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `access_log_${new Date(record.timestamp).getTime()}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }

      alert('✅ Record downloaded successfully')
    } catch (error) {
      console.error('Error downloading record:', error)
      alert('Failed to download record')
    }
  }

  const filteredRecords = filterType === 'all' 
    ? records 
    : records.filter(r => r.type === filterType)

  const recordTypes = ['all', 'Vitals Update', 'Access Log']

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your medical records...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">Error Loading Records</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={loadMedicalRecords}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Medical Records</h1>
        <p className="mt-2 text-gray-600">View your health information and access history</p>
      </div>

      {/* Stats Cards */}
      {records.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{records.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Heart className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Vitals Updates</p>
                <p className="text-2xl font-bold text-gray-900">
                  {records.filter(r => r.type === 'Vitals Update').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Access Logs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {records.filter(r => r.type === 'Access Log').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      {records.length > 0 && (
        <div className="mb-6 flex items-center gap-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <label className="text-sm font-medium text-gray-900">Filter by type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {recordTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Records' : type}
              </option>
            ))}
          </select>
          <span className="ml-auto text-sm text-gray-600">
            Showing {filteredRecords.length} of {records.length} records
          </span>
        </div>
      )}

      {/* Records List */}
      {filteredRecords.length > 0 ? (
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <div key={record.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md">
              <button
                onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {record.type === 'Vitals Update' ? (
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Heart className="h-5 w-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Eye className="h-5 w-5 text-purple-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{record.type}</h3>
                        <p className="mt-1 text-sm text-gray-600">{record.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                      record.status === 'Completed' || record.status === 'Success'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {record.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{record.date}</p>
                  </div>
                </div>
              </button>

              {expandedRecord === record.id && (
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                  {record.type === 'Vitals Update' ? (
                    <VitalsRecordDetails record={record as VitalsRecord} />
                  ) : (
                    <AccessLogDetails record={record as AuditRecord} />
                  )}

                  <div className="mt-4 flex gap-3">
                    <button 
                      onClick={() => handleViewDetails(record)}
                      className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-all duration-200 hover:bg-blue-100"
                    >
                      <FileText className="h-4 w-4" />
                      View Full Details
                    </button>
                    <button 
                      onClick={() => handleDownload(record)}
                      className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition-all duration-200 hover:bg-green-100"
                    >
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Medical Records</h3>
          <p className="text-gray-600">
            {records.length === 0 
              ? "You don't have any medical records yet. Records will appear here once your healthcare provider adds them or updates your vitals."
              : "No records match the selected filter."}
          </p>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="mt-8 rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
        <div className="flex gap-4">
          <Lock className="h-6 w-6 flex-shrink-0 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Your Privacy is Protected</h3>
            <p className="text-sm text-blue-700">
              All your medical records are encrypted with AES-256-GCM encryption and protected by multiple layers of security. 
              You have complete control over who can access your information. Every access to your records is logged and 
              can be reviewed in the Access Log section above.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Component for displaying vitals record details
function VitalsRecordDetails({ record }: { record: VitalsRecord }) {
  const getVitalStatus = (vital: string, value: number) => {
    const ranges: Record<string, { low: number; high: number }> = {
      heartRate: { low: 60, high: 100 },
      systolicBP: { low: 90, high: 140 },
      diastolicBP: { low: 60, high: 90 },
      temperature: { low: 97, high: 99.5 },
      oxygenSaturation: { low: 95, high: 100 },
      respiratoryRate: { low: 12, high: 20 },
      bloodGlucose: { low: 70, high: 140 }
    }

    const range = ranges[vital]
    if (!range) return 'normal'
    if (value < range.low) return 'low'
    if (value > range.high) return 'high'
    return 'normal'
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <User className="h-4 w-4 text-gray-600" />
          <span className="text-sm text-gray-600">Healthcare Provider</span>
        </div>
        <p className="font-medium text-gray-900">{record.nurseName}</p>
        <p className="text-xs text-gray-500">ID: {record.nurseId}</p>
      </div>
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Activity className="h-4 w-4 text-gray-600" />
          <span className="text-sm text-gray-600">Device</span>
        </div>
        <p className="font-medium text-gray-900">{record.deviceType}</p>
      </div>
      
      <div className="col-span-full mt-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Vital Signs Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Heart Rate', value: record.vitals.heartRate, unit: 'bpm', vital: 'heartRate' },
            { label: 'Blood Pressure', value: `${record.vitals.systolicBP}/${record.vitals.diastolicBP}`, unit: 'mmHg', vital: 'systolicBP' },
            { label: 'Temperature', value: record.vitals.temperature, unit: '°F', vital: 'temperature' },
            { label: 'O2 Sat', value: record.vitals.oxygenSaturation, unit: '%', vital: 'oxygenSaturation' }
          ].map((item, idx) => {
            const status = typeof item.value === 'number' ? getVitalStatus(item.vital, item.value) : 'normal'
            const statusColors = {
              normal: 'bg-green-50 border-green-200 text-green-700',
              low: 'bg-blue-50 border-blue-200 text-blue-700',
              high: 'bg-red-50 border-red-200 text-red-700'
            }
            
            return (
              <div key={idx} className={`rounded-lg border p-3 ${statusColors[status as keyof typeof statusColors]}`}>
                <p className="text-xs font-medium opacity-80">{item.label}</p>
                <p className="text-lg font-bold mt-1">{item.value}</p>
                <p className="text-xs mt-0.5">{item.unit}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Component for displaying access log details
function AccessLogDetails({ record }: { record: AuditRecord }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <User className="h-4 w-4 text-gray-600" />
          <span className="text-sm text-gray-600">Accessed By</span>
        </div>
        <p className="font-medium text-gray-900">{record.userName}</p>
        <p className="text-xs text-gray-500">ID: {record.userId}</p>
      </div>
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-600" />
          <span className="text-sm text-gray-600">Action Type</span>
        </div>
        <p className="font-medium text-gray-900">{record.action.replace(/_/g, ' ')}</p>
      </div>
      
      <div className="col-span-full mt-2">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-sm text-gray-700">{record.description}</p>
        </div>
      </div>
    </div>
  )
}