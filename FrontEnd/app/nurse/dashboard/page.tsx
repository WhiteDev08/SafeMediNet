"use client"

import { useEffect, useState } from "react"
import { BarChart3, Heart, Thermometer, Activity, Users, AlertTriangle } from "lucide-react"
import { db, decryptData } from "@/firebase"
import { collection, onSnapshot, query, orderBy, limit, where, getDocs } from "firebase/firestore"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

interface Submission {
  patientId: string
  patientName: string
  time: string
  status: string
  deviceType: string
  temperature?: number
}

interface PatientInfo {
  id: string
  name: string
  assignedNurse: string
}

export default function NurseDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    patientsMonitored: 0,
    parametersSubmitted: 0,
    avgTemperature: 0,
    activeSessions: 0,
  })

  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [patientCache, setPatientCache] = useState<Map<string, PatientInfo>>(new Map())

  // Fetch and cache assigned patients once
  useEffect(() => {
    if (!user?.id) return

    const fetchAssignedPatients = async () => {
      try {
        const patientsQuery = query(
          collection(db, "patients"),
          where("assignedNurse", "==", user.id)
        )
        
        const snapshot = await getDocs(patientsQuery)
        const patientMap = new Map<string, PatientInfo>()
        
        snapshot.forEach((doc) => {
          const data = doc.data()
          patientMap.set(doc.id, {
            id: doc.id,
            name: data.name || "Unknown",
            assignedNurse: data.assignedNurse
          })
        })
        
        setPatientCache(patientMap)
        setStats(prev => ({ ...prev, patientsMonitored: patientMap.size }))
      } catch (err) {
        console.error("Error fetching assigned patients:", err)
        setError("Failed to load patient list")
      }
    }

    fetchAssignedPatients()
  }, [user])

  // Listen to iomt_data submissions
  useEffect(() => {
    if (!user?.id) return

    setLoading(true)

    const iomtQuery = query(
      collection(db, "iomt_data"),
      where("nurseId", "==", user.id),
      orderBy("timestamp", "desc"),
      limit(20)
    )

    const unsubscribeIomt = onSnapshot(
      iomtQuery,
      async (snapshot) => {
        try {
          const submissions: Submission[] = []
          let totalTemp = 0
          let tempCount = 0
          const recentPatientIds = new Set<string>()

          // Process all submissions
          for (const docSnapshot of snapshot.docs) {
            const data = docSnapshot.data()
            const patientId = data.patientId

            // Get patient name from cache
            const patientName = patientCache.get(patientId)?.name || patientId

            // Track unique patients with recent activity (last 20 submissions)
            recentPatientIds.add(patientId)

            // Decrypt vitals to get temperature
            let temperature: number | undefined
            try {
              if (data.parametersEncrypted) {
                const vitals = await decryptData(data.parametersEncrypted)
                if (vitals.temperature) {
                  temperature = vitals.temperature
                  totalTemp += vitals.temperature
                  tempCount++
                }
              }
            } catch (decryptError) {
              console.error(`Decryption failed for ${patientId}:`, decryptError)
            }

            submissions.push({
              patientId,
              patientName,
              time: data.timestamp?.toDate?.()
                ? new Date(data.timestamp.toDate()).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : "Recently",
              status: "Completed",
              deviceType: data.deviceType || "Manual Update",
              temperature
            })
          }

          const avgTemp = tempCount > 0 ? totalTemp / tempCount : 0

          setRecentSubmissions(submissions.slice(0, 5))
          setStats(prev => ({
            ...prev,
            parametersSubmitted: snapshot.size,
            avgTemperature: Math.round(avgTemp * 10) / 10,
            activeSessions: recentPatientIds.size // Patients with recent activity
          }))
          setLoading(false)
          setError(null)
        } catch (err) {
          console.error("Error processing submissions:", err)
          setError("Failed to load recent submissions")
          setLoading(false)
        }
      },
      (err) => {
        console.error("Snapshot listener error:", err)
        setError("Failed to listen to updates. Please refresh.")
        setLoading(false)
      }
    )

    return () => {
      unsubscribeIomt()
    }
  }, [user, patientCache])

  const statCards = [
    { 
      label: "Assigned Patients", 
      value: stats.patientsMonitored, 
      icon: Users, 
      color: "bg-blue-50",
      textColor: "text-blue-600",
      description: "Total patients under your care"
    },
    { 
      label: "Total Submissions", 
      value: stats.parametersSubmitted, 
      icon: Activity, 
      color: "bg-green-50",
      textColor: "text-green-600",
      description: "Recent vitals updates"
    },
    { 
      label: "Avg Temperature", 
      value: stats.avgTemperature ? `${stats.avgTemperature}°C` : "—", 
      icon: Thermometer, 
      color: "bg-orange-50",
      textColor: "text-orange-600",
      description: "Average body temperature"
    },
    { 
      label: "Active Patients", 
      value: stats.activeSessions, 
      icon: BarChart3, 
      color: "bg-purple-50",
      textColor: "text-purple-600",
      description: "Patients with recent data"
    },
  ]

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-secondary">Please log in to access the dashboard</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Nurse Dashboard
        </h1>
        <p className="mt-2 text-secondary">
          Welcome, {user?.name || user?.email?.split("@")[0]}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="card border-l-4 border-red-500 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Error Loading Data</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className={`card p-6 ${stat.color} hover:shadow-md transition-shadow`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-secondary">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-secondary mt-1">{stat.description}</p>
                </div>
                <Icon className={`h-8 w-8 ${stat.textColor} opacity-60`} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Submissions */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Recent Submissions</h2>
          <button
            onClick={() => router.push("/nurse/vitals")}
            className="text-sm text-primary hover:underline"
          >
            View All
          </button>
        </div>
        
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="text-secondary mt-2">Loading submissions...</p>
            </div>
          ) : recentSubmissions.length === 0 ? (
            <div className="text-center py-8 bg-surface-alt rounded-lg">
              <Heart className="mx-auto h-12 w-12 text-secondary opacity-50 mb-3" />
              <p className="text-secondary mb-2 font-semibold">No submissions yet</p>
              <p className="text-sm text-secondary">Start by updating patient vitals!</p>
              <button
                onClick={() => router.push("/nurse/vitals")}
                className="mt-4 inline-block rounded-lg bg-gradient-primary px-6 py-2 text-sm font-semibold text-white hover:shadow-lg transition-all"
              >
                Submit First Entry
              </button>
            </div>
          ) : (
            recentSubmissions.map((submission, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between border-b border-border pb-3 last:border-0 hover:bg-surface-alt p-3 rounded transition-colors cursor-pointer"
                onClick={() => router.push(`/nurse/vitals?patientId=${submission.patientId}`)}
              >
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{submission.patientName}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-secondary">{submission.deviceType}</p>
                    {submission.temperature && (
                      <span className="text-sm text-orange-600 font-medium">
                        {submission.temperature}°C
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-secondary mt-1">{submission.time}</p>
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  {submission.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card border-2 border-dashed border-primary bg-primary/5 p-6 text-center">
          <Heart className="mx-auto mb-3 h-10 w-10 text-primary" />
          <h3 className="mb-2 text-lg font-bold text-foreground">Submit Vitals</h3>
          <p className="mb-4 text-sm text-secondary">Update patient parameters from IoMT devices</p>
          <button
            onClick={() => router.push("/nurse/vitals")}
            className="inline-block rounded-lg bg-gradient-primary px-6 py-2 font-semibold text-white transition-all hover:shadow-lg"
          >
            Submit Parameters
          </button>
        </div>

        <div className="card border-2 border-dashed border-border bg-surface-alt p-6 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-secondary" />
          <h3 className="mb-2 text-lg font-bold text-foreground">View Patients</h3>
          <p className="mb-4 text-sm text-secondary">See all assigned patients and their status</p>
          <button
            onClick={() => router.push("/nurse/patients")}
            className="inline-block rounded-lg border-2 border-primary px-6 py-2 font-semibold text-primary transition-all hover:bg-primary hover:text-white"
          >
            View Patients
          </button>
        </div>
      </div>
    </div>
  )
}