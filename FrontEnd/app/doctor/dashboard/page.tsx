"use client"

import { Activity, Users, FileText, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useState } from "react"

export default function DoctorDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [showAddPatient, setShowAddPatient] = useState(false)

  const stats = [
    { label: "Total Patients", value: "24", icon: Users, bgColor: "bg-blue-100", iconColor: "text-blue-600" },
    { label: "Active Records", value: "8", icon: FileText, bgColor: "bg-green-100", iconColor: "text-green-600" },
    { label: "Pending Reviews", value: "3", icon: Clock, bgColor: "bg-orange-100", iconColor: "text-orange-600" },
    { label: "IoMT Devices", value: "12", icon: Activity, bgColor: "bg-purple-100", iconColor: "text-purple-600" },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Welcome back, Dr. {user?.email?.split("@")[0]}</h1>
        <p className="mt-2 text-secondary">Here's your healthcare dashboard overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="card overflow-hidden p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-secondary">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`rounded-lg ${stat.bgColor} p-3`}>
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Patient Updates</h2>
          <div className="space-y-4">
            {[
              { patient: "John Doe", action: "EHR Updated", time: "2 hours ago" },
              { patient: "Jane Smith", action: "New IoMT Reading", time: "4 hours ago" },
              { patient: "Mike Johnson", action: "Appointment Scheduled", time: "1 day ago" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-border pb-4 last:border-0">
                <div>
                  <p className="font-medium text-foreground">{item.patient}</p>
                  <p className="text-sm text-secondary">{item.action}</p>
                </div>
                <p className="text-xs text-secondary">{item.time}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h2>
          <div className="space-y-3">
            <button onClick={() => setShowAddPatient(true)} className="btn-primary w-full">
              Add Patient
            </button>
            <button onClick={() => router.push("/doctor/ehr")} className="btn-secondary w-full">
              View EHR
            </button>
            <button onClick={() => router.push("/doctor/iomt/logs")} className="btn-secondary w-full">
              Check IoMT Logs
            </button>
          </div>
        </div>
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
