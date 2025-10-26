"use client"

import { Users, Search, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { db, createPatient } from "@/firebase"
import { 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  Timestamp
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
}

export default function DoctorPatientsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!user?.id) return
    fetchPatients()
  }, [user?.id])

  const fetchPatients = async () => {
    try {
      const patientsQuery = query(
        collection(db, 'patients'),
        where('assignedDoctor', '==', user?.id)
      )
      
      const patientsSnapshot = await getDocs(patientsQuery)
      const patientsData: Patient[] = []

      for (const doc of patientsSnapshot.docs) {
        const data = doc.data()
        
        // Get last visit from audit logs
        const logsQuery = query(
          collection(db, 'audit_logs'),
          where('patientId', '==', doc.id)
        )
        const logsSnapshot = await getDocs(logsQuery)
        
        let lastVisit = 'Never'
        if (!logsSnapshot.empty) {
          const lastLog = logsSnapshot.docs[0].data()
          lastVisit = lastLog.timestamp?.toDate().toLocaleDateString() || 'N/A'
        }

        // Calculate age from DOB
        let age = 0
        if (data.dob) {
          const birthDate = new Date(data.dob)
          const today = new Date()
          age = today.getFullYear() - birthDate.getFullYear()
        }

        // Determine status based on last activity
        const lastUpdateTime = data.lastUpdated?.toDate().getTime() || 0
        const daysSinceUpdate = (Date.now() - lastUpdateTime) / (1000 * 60 * 60 * 24)
        const status = daysSinceUpdate < 30 ? 'Active' : 'Inactive'

        patientsData.push({
          id: doc.id,
          name: data.name,
          age: age,
          status: status,
          lastVisit: lastVisit,
          email: data.email,
          phone: data.phone
        })
      }

      setPatients(patientsData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching patients:', error)
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter((p) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddPatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      const patientData = {
        id: `PAT-${Date.now()}`,
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        dob: formData.get('dob') as string,
        bloodType: formData.get('bloodType') as string || 'O+',
        password: 'default123', // Temporary password
        assignedDoctor: user?.id,
        assignedNurse: ''
      }

      await createPatient(patientData)

      // Create alert for new patient
      await addDoc(collection(db, 'alerts'), {
        type: 'New Patient',
        message: `New patient ${patientData.name} added to your care`,
        severity: 'low',
        timestamp: Timestamp.now(),
        doctorId: user?.id,
        resolved: false
      })

      // Log the action
      await addDoc(collection(db, 'audit_logs'), {
        userId: user?.id,
        userName: user?.name,
        action: 'PATIENT_ADDED',
        targetType: 'patient',
        targetId: patientData.id,
        patientName: patientData.name,
        timestamp: Timestamp.now()
      })

      setShowAddPatient(false)
      alert('Patient added successfully!')
      fetchPatients() // Refresh list
    } catch (error) {
      console.error('Error adding patient:', error)
      alert('Failed to add patient')
    }
  }

  const handleSendMessage = async (patient: Patient) => {
    try {
      // Log message action
      await addDoc(collection(db, 'audit_logs'), {
        userId: user?.id,
        userName: user?.name,
        action: 'MESSAGE_SENT',
        targetType: 'patient',
        targetId: patient.id,
        patientName: patient.name,
        timestamp: Timestamp.now()
      })

      alert(`Message sent to ${patient.name}`)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-secondary">Loading patients...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Patients</h1>
          <p className="mt-2 text-secondary">Manage your patient list ({patients.length} total)</p>
        </div>
        <button
          onClick={() => setShowAddPatient(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-primary px-6 py-2.5 font-semibold text-white transition-all duration-300 hover:shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Add Patient
        </button>
      </div>

      {/* Search */}
      <div className="card mb-6 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            placeholder="Search patients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPatients.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-secondary">No patients found</p>
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <div key={patient.id} className="card p-6 hover:shadow-lg transition-all duration-200">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                    patient.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {patient.status}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground">{patient.name}</h3>
              <p className="mt-1 text-sm text-secondary">Age: {patient.age}</p>
              <p className="text-sm text-secondary">Last visit: {patient.lastVisit}</p>
              <p className="text-sm text-secondary mt-1">{patient.email}</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => router.push("/doctor/ehr")}
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="card p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-foreground">Add New Patient</h3>
            <form onSubmit={handleAddPatient} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Patient Name *</label>
                <input 
                  type="text" 
                  name="name"
                  placeholder="Enter patient name" 
                  className="input-field" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
                <input 
                  type="email" 
                  name="email"
                  placeholder="patient@example.com" 
                  className="input-field" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Phone *</label>
                <input 
                  type="tel" 
                  name="phone"
                  placeholder="(555) 123-4567" 
                  className="input-field" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Date of Birth *</label>
                <input 
                  type="date" 
                  name="dob"
                  className="input-field" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Blood Type</label>
                <select name="bloodType" className="input-field">
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
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
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