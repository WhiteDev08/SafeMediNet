"use client"

import { Users, Search, Plus, Activity, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { db, createPatient } from "@/firebase"
import { 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  Timestamp,
  orderBy,
  limit,
  doc,
  getDoc
} from "firebase/firestore"
import { useAuth } from "@/hooks/use-auth"

interface Patient {
  id: string
  name: string
  age: number
  status: string
  lastVisit: string
  email: string
  phone: string
  bloodType?: string
  dob?: string
  assignedNurse?: string
  lastUpdated?: any
}

export default function DoctorPatientsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (user?.id) {
      fetchPatients()
    }
  }, [user?.id])

  const fetchPatients = async () => {
    if (!user?.id) {
      setError("User not authenticated")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Query patients assigned to this doctor
      const patientsQuery = query(
        collection(db, 'patients'),
        where('assignedDoctor', '==', user.id)
      )
      
      const patientsSnapshot = await getDocs(patientsQuery)
      
      if (patientsSnapshot.empty) {
        console.log('No patients found for doctor:', user.id)
        setPatients([])
        setLoading(false)
        return
      }

      const patientsData: Patient[] = []

      for (const docSnapshot of patientsSnapshot.docs) {
        const data = docSnapshot.data()
        
        // Calculate age from DOB
        let age = 0
        if (data.dob) {
          try {
            const birthDate = new Date(data.dob)
            const today = new Date()
            age = today.getFullYear() - birthDate.getFullYear()
            const monthDiff = today.getMonth() - birthDate.getMonth()
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--
            }
          } catch (dobError) {
            console.warn('Error calculating age for patient:', docSnapshot.id, dobError)
          }
        }

        // Get last visit from iomt_data collection (vitals updates)
        let lastVisit = 'Never'
        try {
          const iomtQuery = query(
            collection(db, 'iomt_data'),
            where('patientId', '==', docSnapshot.id),
            orderBy('timestamp', 'desc'),
            limit(1)
          )
          const iomtSnapshot = await getDocs(iomtQuery)
          
          if (!iomtSnapshot.empty) {
            const lastUpdate = iomtSnapshot.docs[0].data()
            if (lastUpdate.timestamp) {
              const timestamp = lastUpdate.timestamp.toDate ? 
                lastUpdate.timestamp.toDate() : 
                new Date(lastUpdate.timestamp)
              lastVisit = timestamp.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            }
          }
        } catch (logError) {
          console.warn('Error fetching last visit for patient:', docSnapshot.id, logError)
        }

        // Determine status based on last activity
        let status = 'Inactive'
        if (data.lastUpdated) {
          try {
            const lastUpdateTime = data.lastUpdated.toDate ? 
              data.lastUpdated.toDate().getTime() : 
              new Date(data.lastUpdated).getTime()
            const daysSinceUpdate = (Date.now() - lastUpdateTime) / (1000 * 60 * 60 * 24)
            status = daysSinceUpdate < 30 ? 'Active' : 'Inactive'
          } catch (statusError) {
            console.warn('Error determining status for patient:', docSnapshot.id, statusError)
          }
        }

        patientsData.push({
          id: docSnapshot.id,
          name: data.name || 'Unknown',
          age: age,
          status: status,
          lastVisit: lastVisit,
          email: data.email || '',
          phone: data.phone || '',
          bloodType: data.bloodType || 'N/A',
          dob: data.dob,
          assignedNurse: data.assignedNurse,
          lastUpdated: data.lastUpdated
        })
      }

      // Sort by last updated (most recent first)
      patientsData.sort((a, b) => {
        if (!a.lastUpdated) return 1
        if (!b.lastUpdated) return -1
        const aTime = a.lastUpdated.toDate ? a.lastUpdated.toDate().getTime() : 0
        const bTime = b.lastUpdated.toDate ? b.lastUpdated.toDate().getTime() : 0
        return bTime - aTime
      })

      console.log(`Fetched ${patientsData.length} patients for doctor ${user.id}`)
      setPatients(patientsData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching patients:', error)
      setError('Failed to load patients. Please try again.')
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter((p) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddPatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      const patientId = `PAT-${Date.now()}`
      const patientData = {
        id: patientId,
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        dob: formData.get('dob') as string,
        bloodType: formData.get('bloodType') as string || 'O+',
        password: 'SafeMedi2025!', // Default password
        assignedDoctor: user?.id || '',
        assignedNurse: '' // Can be assigned later
      }

      // Create patient using firebase.ts function
      await createPatient(patientData)

      // Create alert for new patient
      try {
        await addDoc(collection(db, 'alerts'), {
          type: 'New Patient',
          message: `New patient ${patientData.name} (${patientId}) added to your care`,
          severity: 'low',
          timestamp: Timestamp.now(),
          doctorId: user?.id,
          patientId: patientId,
          resolved: false
        })
      } catch (alertError) {
        console.warn('Failed to create alert:', alertError)
      }

      // Log the action in audit_logs
      try {
        await addDoc(collection(db, 'audit_logs'), {
          userId: user?.id,
          userName: user?.name,
          action: 'PATIENT_ADDED',
          targetType: 'patient',
          targetId: patientId,
          patientName: patientData.name,
          timestamp: Timestamp.now(),
          ipAddress: 'N/A',
          userAgent: navigator.userAgent,
          status: 'Success',
          details: `Patient ${patientData.name} added by Dr. ${user?.name}`
        })
      } catch (logError) {
        console.warn('Failed to create audit log:', logError)
      }

      setShowAddPatient(false)
      alert(`✅ Patient added successfully!\n\nPatient ID: ${patientId}\nDefault Password: SafeMedi2025!\n\nPlease share these credentials with the patient securely.`)
      
      // Refresh patient list
      await fetchPatients()
    } catch (error: any) {
      console.error('Error adding patient:', error)
      alert(`❌ Failed to add patient: ${error.message || 'Unknown error'}`)
    }
  }

  const handleSendMessage = async (patient: Patient) => {
    try {
      // Log message action in audit_logs
      await addDoc(collection(db, 'audit_logs'), {
        userId: user?.id,
        userName: user?.name,
        action: 'MESSAGE_SENT',
        targetType: 'patient',
        targetId: patient.id,
        patientName: patient.name,
        timestamp: Timestamp.now(),
        ipAddress: 'N/A',
        userAgent: navigator.userAgent,
        status: 'Success',
        details: `Message sent to patient ${patient.name}`
      })

      alert(`✉️ Message sent to ${patient.name}\n\nThis feature would integrate with your messaging system.`)
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    }
  }

  const handleViewPatient = (patient: Patient) => {
    // Store patient ID for EHR view
    sessionStorage.setItem('selectedPatientId', patient.id)
    
    // Log view action
    addDoc(collection(db, 'audit_logs'), {
      userId: user?.id,
      userName: user?.name,
      action: 'PATIENT_VIEW',
      targetType: 'patient',
      targetId: patient.id,
      patientName: patient.name,
      timestamp: Timestamp.now(),
      status: 'Success'
    }).catch(err => console.warn('Failed to log view action:', err))
    
    router.push("/doctor/ehr")
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading patients...</p>
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
            <h3 className="text-lg font-semibold text-red-900">Error Loading Patients</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={fetchPatients}
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
          <p className="mt-2 text-gray-600">
            Manage your patient list ({patients.length} total)
          </p>
        </div>
        <button
          onClick={() => setShowAddPatient(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 font-semibold text-white transition-all duration-300 hover:shadow-lg hover:scale-105"
        >
          <Plus className="h-5 w-5" />
          Add Patient
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPatients.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              {searchTerm ? 'No patients match your search' : 'No patients assigned yet'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddPatient(true)}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Patient
              </button>
            )}
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <div key={patient.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                    patient.status === "Active" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {patient.status}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
              <p className="mt-1 text-sm text-gray-600">ID: {patient.id}</p>
              <p className="text-sm text-gray-600">Age: {patient.age || 'N/A'}</p>
              <p className="text-sm text-gray-600">Blood Type: {patient.bloodType}</p>
              <p className="text-sm text-gray-600">Last visit: {patient.lastVisit}</p>
              <p className="text-sm text-gray-500 mt-1 truncate">{patient.email}</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleViewPatient(patient)}
                  className="flex-1 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition-all duration-200 hover:bg-blue-100"
                >
                  View Records
                </button>
                <button
                  onClick={() => handleSendMessage(patient)}
                  className="flex-1 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700 transition-all duration-200 hover:bg-green-100"
                >
                  Message
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Patient Modal */}
      {showAddPatient && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Add New Patient</h3>
            <p className="text-sm text-gray-600 mb-4">
              Default password will be: <span className="font-mono font-semibold bg-gray-100 px-2 py-1 rounded">SafeMedi2025!</span>
            </p>
            <form onSubmit={handleAddPatient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Patient Name *
                </label>
                <input 
                  type="text" 
                  name="name"
                  placeholder="Enter patient name" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Email *
                </label>
                <input 
                  type="email" 
                  name="email"
                  placeholder="patient@example.com" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Phone *
                </label>
                <input 
                  type="tel" 
                  name="phone"
                  placeholder="(555) 123-4567" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Date of Birth *
                </label>
                <input 
                  type="date" 
                  name="dob"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Blood Type
                </label>
                <select name="bloodType" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddPatient(false)} 
                  className="flex-1 bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Add Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}