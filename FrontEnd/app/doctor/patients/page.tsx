"use client"

import { Users, Search, Plus } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DoctorPatientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddPatient, setShowAddPatient] = useState(false)
  const router = useRouter()

  const patients = [
    { id: "1", name: "John Doe", age: 45, status: "Active", lastVisit: "Oct 20, 2025" },
    { id: "2", name: "Jane Smith", age: 38, status: "Active", lastVisit: "Oct 18, 2025" },
    { id: "3", name: "Mike Johnson", age: 52, status: "Inactive", lastVisit: "Sep 15, 2025" },
    { id: "4", name: "Sarah Williams", age: 41, status: "Active", lastVisit: "Oct 22, 2025" },
  ]

  const filteredPatients = patients.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Patients</h1>
          <p className="mt-2 text-secondary">Manage your patient list</p>
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
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPatients.map((patient) => (
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
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => router.push("/doctor/ehr")}
                className="flex-1 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition-all duration-200 hover:bg-blue-100"
              >
                View Records
              </button>
              <button
                onClick={() => alert(`Message sent to ${patient.name}`)}
                className="flex-1 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700 transition-all duration-200 hover:bg-green-100"
              >
                Message
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Patient Modal */}
      {showAddPatient && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="card p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground">Add New Patient</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Patient Name</label>
                <input type="text" placeholder="Enter patient name" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input type="email" placeholder="patient@example.com" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                <input type="tel" placeholder="(555) 123-4567" className="input-field" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowAddPatient(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowAddPatient(false)
                    alert("Patient added successfully!")
                  }}
                  className="btn-primary flex-1"
                >
                  Add Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
