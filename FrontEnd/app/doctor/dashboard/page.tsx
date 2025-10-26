"use client"

import { Activity, Users, FileText, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"
import { db } from "@/firebase"
import { collection, onSnapshot, query, orderBy } from "firebase/firestore"

export default function DoctorDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [dashboardStats, setDashboardStats] = useState({
    totalPatients: 0,
    activeRecords: 0,
    pendingReviews: 0,
    iomtDevices: 0,
  })
  const [recentUpdates, setRecentUpdates] = useState<
    { patient: string; action: string; time: string }[]
  >([])

  // 🔥 Fetch data from Firestore (Realtime)
  useEffect(() => {
    // Total Patients
    const unsubPatients = onSnapshot(collection(db, "patients"), (snap) => {
      setDashboardStats((prev) => ({ ...prev, totalPatients: snap.size }))
    })

    // Active EHR Records
    const unsubEHR = onSnapshot(collection(db, "ehr_records"), (snap) => {
      setDashboardStats((prev) => ({ ...prev, activeRecords: snap.size }))
    })

    // Pending Reviews
    const unsubReviews = onSnapshot(collection(db, "reviews"), (snap) => {
      const pendingCount = snap.docs.filter((doc) => doc.data().status === "pending").length
      setDashboardStats((prev) => ({ ...prev, pendingReviews: pendingCount }))
    })

    // IoMT Devices
    const unsubDevices = onSnapshot(collection(db, "iomt_logs"), (snap) => {
      setDashboardStats((prev) => ({ ...prev, iomtDevices: snap.size }))
    })

    // Recent Patient Updates
    const updatesQuery = query(collection(db, "patient_updates"), orderBy("timestamp", "desc"))
    const unsubUpdates = onSnapshot(updatesQuery, (snap) => {
      const updates = snap.docs.map((doc) => {
        const d = doc.data()
        return {
          patient: d.patientName || "Unknown",
          action: d.action || "Update",
          time: new Date(d.timestamp?.toDate?.() || Date.now()).toLocaleString(),
        }
      })
      setRecentUpdates(updates.slice(0, 5))
    })

    return () => {
      unsubPatients()
      unsubEHR()
      unsubReviews()
      unsubDevices()
      unsubUpdates()
    }
  }, [])

  const stats = [
    {
      label: "Total Patients",
      value: dashboardStats.totalPatients,
      icon: Users,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Active Records",
      value: dashboardStats.activeRecords,
      icon: FileText,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Pending Reviews",
      value: dashboardStats.pendingReviews,
      icon: Clock,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      label: "IoMT Devices",
      value: dashboardStats.iomtDevices,
      icon: Activity,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, Dr. {user?.email?.split("@")[0]}
        </h1>
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
            {recentUpdates.length === 0 ? (
              <p className="text-secondary">No recent updates found.</p>
            ) : (
              recentUpdates.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-border pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.patient}</p>
                    <p className="text-sm text-secondary">{item.action}</p>
                  </div>
                  <p className="text-xs text-secondary">{item.time}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="card mx-4 w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-foreground">Add New Patient</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Patient Name</label>
                <input type="text" placeholder="Enter patient name" className="input-field" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Email</label>
                <input type="email" placeholder="patient@example.com" className="input-field" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Phone</label>
                <input type="tel" placeholder="(555) 123-4567" className="input-field" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowAddPatient(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // 🔥 In future: Add patient to Firestore
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
