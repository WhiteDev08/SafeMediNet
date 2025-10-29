"use client"

import { Activity, Users, FileText, Clock, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"
import { db } from "@/firebase"
import { collection, onSnapshot, query, orderBy, limit, doc, getDoc } from "firebase/firestore"

interface RecentUpdate {
  patientName: string
  nurseName: string
  action: string
  time: string
  threat?: string
}

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
  const [recentUpdates, setRecentUpdates] = useState<RecentUpdate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    // Listen to patients collection
    const unsubPatients = onSnapshot(collection(db, "patients"), (snap) => {
      setDashboardStats((prev) => ({ ...prev, totalPatients: snap.size }))
    })

    // Listen to iomt_data collection for recent updates and device count
    const iomtQuery = query(
      collection(db, "iomt_data"),
      orderBy("timestamp", "desc"),
      limit(10)
    )
    
    const unsubIomt = onSnapshot(iomtQuery, async (snap) => {
      setDashboardStats((prev) => ({ ...prev, iomtDevices: snap.size }))

      // Get recent updates with patient and nurse names
      const updates: RecentUpdate[] = []
      
      for (const docSnapshot of snap.docs) {
        const data = docSnapshot.data()
        
        // Fetch patient name
        let patientName = data.patientId
        try {
          const patientRef = doc(db, 'patients', data.patientId)
          const patientDoc = await getDoc(patientRef)
          if (patientDoc.exists()) {
            patientName = patientDoc.data()?.name || data.patientId
          }
        } catch (error) {
          console.error('Error fetching patient:', error)
        }
        
        // Fetch nurse name
        let nurseName = data.nurseId
        try {
          const nurseRef = doc(db, 'nurses', data.nurseId)
          const nurseDoc = await getDoc(nurseRef)
          if (nurseDoc.exists()) {
            nurseName = nurseDoc.data()?.name || data.nurseId
          }
        } catch (error) {
          console.error('Error fetching nurse:', error)
        }

        updates.push({
          patientName: patientName || 'Unknown Patient',
          nurseName: nurseName || 'Unknown Nurse',
          action: `Updated vitals via ${data.deviceType}`,
          time: data.timestamp?.toDate?.() 
            ? new Date(data.timestamp.toDate()).toLocaleString() 
            : 'Recently',
        })
      }
      
      setRecentUpdates(updates.slice(0, 5))
      setLoading(false)
    })

    // Count patients with high threat levels as "pending reviews"
    const unsubPatientsReview = onSnapshot(collection(db, "patients"), (snap) => {
      const highThreatCount = snap.docs.filter(
        (doc) => doc.data().threatLevel === "high" || doc.data().session_state?.login_suspicion === "high"
      ).length
      setDashboardStats((prev) => ({ ...prev, pendingReviews: highThreatCount }))
    })

    // Active records = patients with vitals
    const unsubActiveRecords = onSnapshot(collection(db, "patients"), (snap) => {
      const activeCount = snap.docs.filter((doc) => doc.data().vitalsEncrypted).length
      setDashboardStats((prev) => ({ ...prev, activeRecords: activeCount }))
    })

    return () => {
      unsubPatients()
      unsubIomt()
      unsubPatientsReview()
      unsubActiveRecords()
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
      label: "High Risk Patients",
      value: dashboardStats.pendingReviews,
      icon: AlertTriangle,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      label: "Recent IoMT Updates",
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
          Welcome back, Dr. {user?.email?.split("@")[0] || user?.name}
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
          <h2 className="mb-4 text-lg font-semibold text-foreground">Recent IoMT Updates</h2>
          <div className="space-y-4">
            {loading ? (
              <p className="text-secondary">Loading updates...</p>
            ) : recentUpdates.length === 0 ? (
              <p className="text-secondary">No recent updates found.</p>
            ) : (
              recentUpdates.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-border pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.patientName}</p>
                    <p className="text-sm text-secondary">{item.action}</p>
                    <p className="text-xs text-secondary">by {item.nurseName}</p>
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
            <button onClick={() => router.push("/doctor/patients")} className="btn-primary w-full">
              View All Patients
            </button>
            <button onClick={() => router.push("/doctor/ehr")} className="btn-secondary w-full">
              View EHR Records
            </button>
            <button onClick={() => router.push("/doctor/iomt/logs")} className="btn-secondary w-full">
              Check IoMT Logs
            </button>
            <button onClick={() => router.push("/doctor/alerts")} className="btn-secondary w-full">
              Security Alerts
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}