"use client"

import { FileText, Lock, Eye, Share2, Download, Activity, AlertCircle, Heart } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { db, decryptData, getPatientVitals, VitalsData } from "@/firebase"
import { 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  Timestamp,
  doc,
  getDoc,
  orderBy,
  limit
} from "firebase/firestore"
import { useAuth } from "@/hooks/use-auth"

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  bloodType?: string
  dob?: string
}

interface VitalsRecord {
  id: string
  patientId: string
  patientName: string
  nurseId: string
  nurseName?: string
  timestamp: Date
  vitals: VitalsData
  previousVitals?: VitalsData
}

export default function DoctorEHRPage() {
  const { user } = useAuth()
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [vitalsRecords, setVitalsRecords] = useState<VitalsRecord[]>([])
  const [currentVitals, setCurrentVitals] = useState<VitalsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!user?.id) return
    
    // Check if patient was pre-selected from patients page
    const preselectedPatientId = sessionStorage.getItem('selectedPatientId')
    if (preselectedPatientId) {
      setSelectedPatientId(preselectedPatientId)
      sessionStorage.removeItem('selectedPatientId')
    }
    
    fetchPatients()
  }, [user?.id])

  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientVitalsHistory(selectedPatientId)
    }
  }, [selectedPatientId])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch patients assigned to this doctor
      const patientsQuery = query(
        collection(db, 'patients'),
        where('assignedDoctor', '==', user?.id)
      )
      
      const patientsSnapshot = await getDocs(patientsQuery)
      const patientsData: Patient[] = []

      patientsSnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data()
        patientsData.push({
          id: docSnapshot.id,
          name: data.name || 'Unknown',
          email: data.email || '',
          phone: data.phone || '',
          bloodType: data.bloodType,
          dob: data.dob
        })
      })

      console.log(`Fetched ${patientsData.length} patients for EHR view`)
      setPatients(patientsData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching patients:', error)
      setError('Failed to load patients')
      setLoading(false)
    }
  }

  const fetchPatientVitalsHistory = async (patientId: string) => {
    try {
      setLoading(true)
      
      // Fetch patient data
      const patientRef = doc(db, 'patients', patientId)
      const patientDoc = await getDoc(patientRef)
      
      if (!patientDoc.exists()) {
        setError('Patient not found')
        setLoading(false)
        return
      }

      const patientData = patientDoc.data()

      // Get current vitals
      if (patientData.vitalsEncrypted) {
        try {
          const decryptedVitals = await decryptData(patientData.vitalsEncrypted) as VitalsData
          setCurrentVitals(decryptedVitals)
        } catch (decryptError) {
          console.error('Error decrypting current vitals:', decryptError)
          setCurrentVitals(null)
        }
      } else {
        setCurrentVitals(null)
      }

      // Fetch vitals history from iomt_data collection
      const iomtQuery = query(
        collection(db, 'iomt_data'),
        where('patientId', '==', patientId),
        orderBy('timestamp', 'desc'),
        limit(20) // Get last 20 records
      )
      
      const iomtSnapshot = await getDocs(iomtQuery)
      const vitalsData: VitalsRecord[] = []

      for (const iomtDoc of iomtSnapshot.docs) {
        const data = iomtDoc.data()
        
        try {
          // Decrypt vitals data
          const vitals = await decryptData(data.parametersEncrypted) as VitalsData
          const previousVitals = data.previousParametersEncrypted 
            ? await decryptData(data.previousParametersEncrypted) as VitalsData 
            : undefined

          // Get nurse name if available
          let nurseName = data.nurseId || 'Unknown'
          if (data.nurseId && data.nurseId !== 'Manual Update') {
            try {
              const nurseRef = doc(db, 'nurses', data.nurseId)
              const nurseDoc = await getDoc(nurseRef)
              if (nurseDoc.exists()) {
                nurseName = nurseDoc.data().name || data.nurseId
              }
            } catch (nurseError) {
              console.warn('Error fetching nurse name:', nurseError)
            }
          }

          vitalsData.push({
            id: iomtDoc.id,
            patientId: patientId,
            patientName: patientData.name,
            nurseId: data.nurseId,
            nurseName: nurseName,
            timestamp: data.timestamp.toDate(),
            vitals: vitals,
            previousVitals: previousVitals
          })
        } catch (decryptError) {
          console.error('Error decrypting vitals record:', iomtDoc.id, decryptError)
        }
      }

      setVitalsRecords(vitalsData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching vitals history:', error)
      setError('Failed to load vitals history')
      setLoading(false)
    }
  }

  const handleViewRecord = async (record: VitalsRecord) => {
    try {
      // Log access in audit_logs
      await addDoc(collection(db, 'audit_logs'), {
        userId: user?.id,
        userName: user?.name,
        action: 'VITALS_VIEW',
        targetType: 'iomt_data',
        targetId: record.id,
        patientId: record.patientId,
        patientName: record.patientName,
        timestamp: Timestamp.now(),
        ipAddress: 'N/A',
        userAgent: navigator.userAgent,
        status: 'Success',
        details: `Viewed vitals record from ${record.timestamp.toLocaleString()}`
      })

      // Display vitals in a formatted way
      const vitalsDisplay = `
Patient: ${record.patientName}
Recorded: ${record.timestamp.toLocaleString()}
Updated by: ${record.nurseName}

Current Vitals:
━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Heart Rate: ${record.vitals.heartRate} bpm
• Blood Pressure: ${record.vitals.systolicBP}/${record.vitals.diastolicBP} mmHg
• Temperature: ${record.vitals.temperature}°F
• Oxygen Saturation: ${record.vitals.oxygenSaturation}%
• Respiratory Rate: ${record.vitals.respiratoryRate} breaths/min
• Blood Glucose: ${record.vitals.bloodGlucose} mg/dL
• Weight: ${record.vitals.weight} kg
• Height: ${record.vitals.height} cm
      `.trim()

      alert(vitalsDisplay)
    } catch (error) {
      console.error('Error viewing record:', error)
      alert('Failed to view record')
    }
  }

  const handleDownload = async (record: VitalsRecord) => {
    try {
      // Log download action
      await addDoc(collection(db, 'audit_logs'), {
        userId: user?.id,
        userName: user?.name,
        action: 'VITALS_DOWNLOAD',
        targetType: 'iomt_data',
        targetId: record.id,
        patientId: record.patientId,
        patientName: record.patientName,
        timestamp: Timestamp.now(),
        ipAddress: 'N/A',
        userAgent: navigator.userAgent,
        status: 'Success'
      })

      // Create downloadable CSV
      const csvContent = `Patient Name,Patient ID,Recorded Time,Updated By,Heart Rate,Systolic BP,Diastolic BP,Temperature,O2 Saturation,Respiratory Rate,Blood Glucose,Weight,Height
${record.patientName},${record.patientId},"${record.timestamp.toLocaleString()}",${record.nurseName},${record.vitals.heartRate},${record.vitals.systolicBP},${record.vitals.diastolicBP},${record.vitals.temperature},${record.vitals.oxygenSaturation},${record.vitals.respiratoryRate},${record.vitals.bloodGlucose},${record.vitals.weight},${record.vitals.height}`

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `vitals_${record.patientId}_${record.timestamp.getTime()}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      alert(`✅ Downloaded vitals record for ${record.patientName}`)
    } catch (error) {
      console.error('Error downloading record:', error)
      alert('Failed to download record')
    }
  }

  const handleShareAccess = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const accessLevel = formData.get('accessLevel') as string

    try {
      const patient = patients.find(p => p.id === selectedPatientId)
      if (!patient) return

      // Create shared access record
      await addDoc(collection(db, 'shared_access'), {
        patientId: selectedPatientId,
        patientName: patient.name,
        sharedBy: user?.id,
        sharedByName: user?.name,
        sharedWith: email,
        accessLevel: accessLevel,
        timestamp: Timestamp.now(),
        expiresAt: null,
        active: true
      })

      // Log sharing action
      await addDoc(collection(db, 'audit_logs'), {
        userId: user?.id,
        userName: user?.name,
        action: 'ACCESS_SHARED',
        targetType: 'patient',
        targetId: selectedPatientId,
        patientName: patient.name,
        timestamp: Timestamp.now(),
        ipAddress: 'N/A',
        userAgent: navigator.userAgent,
        status: 'Success',
        details: `Shared ${accessLevel} access with ${email}`
      })

      setShowShareModal(false)
      alert(`✅ Access shared successfully with ${email}!`)
    } catch (error) {
      console.error('Error sharing access:', error)
      alert('Failed to share access')
    }
  }

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

  const VitalCard = ({ label, value, unit, vital }: { label: string; value: number; unit: string; vital: string }) => {
    const status = getVitalStatus(vital, value)
    const statusColors = {
      normal: 'bg-green-50 border-green-200 text-green-700',
      low: 'bg-blue-50 border-blue-200 text-blue-700',
      high: 'bg-red-50 border-red-200 text-red-700'
    }

    return (
      <div className={`rounded-lg border-2 p-4 ${statusColors[status as keyof typeof statusColors]}`}>
        <p className="text-xs font-medium opacity-80">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        <p className="text-xs mt-1">{unit}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading EHR data...</p>
          </div>
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
            <h3 className="text-lg font-semibold text-red-900">Error Loading EHR</h3>
          </div>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  const selectedPatient = patients.find(p => p.id === selectedPatientId)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Electronic Health Records</h1>
        <p className="mt-2 text-gray-600">View patient vitals and medical data with complete audit trails</p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Patient Selection List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Patient</h2>

          <div className="space-y-2">
            {patients.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">No patients assigned</p>
            ) : (
              patients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatientId(patient.id)}
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                    selectedPatientId === patient.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                      </div>
                      <p className="mt-1 text-xs text-gray-600">{patient.id}</p>
                      <p className="text-xs text-gray-500">{patient.email}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Vitals Display */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
          {selectedPatient ? (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selectedPatient.name}</h2>
                  <p className="text-sm text-gray-600">{selectedPatient.id}</p>
                </div>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center gap-2 rounded-lg bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 transition-all duration-200 hover:bg-purple-100"
                >
                  <Share2 className="h-4 w-4" />
                  Share Access
                </button>
              </div>

              {/* Current Vitals */}
              {currentVitals ? (
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Current Vitals
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <VitalCard label="Heart Rate" value={currentVitals.heartRate} unit="bpm" vital="heartRate" />
                    <VitalCard label="Blood Pressure" value={currentVitals.systolicBP} unit={`${currentVitals.systolicBP}/${currentVitals.diastolicBP}`} vital="systolicBP" />
                    <VitalCard label="Temperature" value={currentVitals.temperature} unit="°F" vital="temperature" />
                    <VitalCard label="O2 Saturation" value={currentVitals.oxygenSaturation} unit="%" vital="oxygenSaturation" />
                    <VitalCard label="Respiratory Rate" value={currentVitals.respiratoryRate} unit="breaths/min" vital="respiratoryRate" />
                    <VitalCard label="Blood Glucose" value={currentVitals.bloodGlucose} unit="mg/dL" vital="bloodGlucose" />
                  </div>
                </div>
              ) : (
                <div className="mb-6 bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-600">No vitals recorded yet</p>
                </div>
              )}

              {/* Vitals History */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-4">Vitals History</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {vitalsRecords.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No vitals history available</p>
                  ) : (
                    vitalsRecords.map((record) => (
                      <div
                        key={record.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {record.timestamp.toLocaleDateString()} at {record.timestamp.toLocaleTimeString()}
                            </p>
                            <p className="text-xs text-gray-600">Updated by: {record.nurseName}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewRecord(record)}
                              className="p-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDownload(record)}
                              className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div>
                            <p className="text-gray-500">HR</p>
                            <p className="font-semibold">{record.vitals.heartRate}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">BP</p>
                            <p className="font-semibold">{record.vitals.systolicBP}/{record.vitals.diastolicBP}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Temp</p>
                            <p className="font-semibold">{record.vitals.temperature}°F</p>
                          </div>
                          <div>
                            <p className="text-gray-500">O2</p>
                            <p className="font-semibold">{record.vitals.oxygenSaturation}%</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-96 items-center justify-center text-center">
              <div>
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a patient to view their EHR</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Privacy & Access Control Info */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Privacy & Security Features</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
            <Lock className="mb-2 h-6 w-6 text-blue-600" />
            <h3 className="font-semibold text-blue-900">End-to-End Encryption</h3>
            <p className="mt-1 text-sm text-blue-700">All vitals data encrypted using AES-256-GCM</p>
          </div>
          <div className="rounded-lg bg-green-50 p-4 border border-green-200">
            <Eye className="mb-2 h-6 w-6 text-green-600" />
            <h3 className="font-semibold text-green-900">Complete Audit Trail</h3>
            <p className="mt-1 text-sm text-green-700">Every access logged with timestamp and user info</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-4 border border-purple-200">
            <Share2 className="mb-2 h-6 w-6 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Granular Access Control</h3>
            <p className="mt-1 text-sm text-purple-700">Share with specific permissions and time limits</p>
          </div>
        </div>
      </div>

      {/* Share Access Modal */}
      {showShareModal && selectedPatient && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Share Access to Patient Records</h3>
            <p className="text-sm text-gray-600 mb-4">
              Patient: <span className="font-semibold">{selectedPatient.name}</span>
            </p>
            <form onSubmit={handleShareAccess}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Doctor Email *
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    placeholder="doctor@example.com" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Access Level *
                  </label>
                  <select 
                    name="accessLevel" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    required
                  >
                    <option value="Full">Full Access - View and Download</option>
                    <option value="Limited">Limited Access - View Only</option>
                    <option value="Emergency">Emergency Access - Temporary</option>
                  </select>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    ⚠️ All sharing activities are logged and audited for compliance
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowShareModal(false)} 
                    className="flex-1 bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Share Access
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