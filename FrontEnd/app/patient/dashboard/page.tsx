"use client"

import { Heart, TrendingUp, AlertCircle, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"
import { db } from "@/firebase"
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore"

export default function PatientDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  const [metrics, setMetrics] = useState({
    heartRate: "—",
    bloodPressure: "—",
    temperature: "—",
    lastCheckup: "—",
  })

  const [records, setRecords] = useState<
    { type: string; date: string; doctor: string }[]
  >([])

  const [alerts, setAlerts] = useState<
    { title: string; description: string; color: string }[]
  >([])

  // 🔥 Fetch data live from Firestore
  useEffect(() => {
    if (!user?.email) return

    // Vitals listener
    const vitalsQuery = query(
      collection(db, "vitals"),
      where("patientEmail", "==", user.email),
      orderBy("timestamp", "desc")
    )
    const unsubVitals = onSnapshot(vitalsQuery, (snap) => {
      if (!snap.empty) {
        const latest = snap.docs[0].data()
        setMetrics({
          heartRate: `${latest.heartRate || "—"} bpm`,
          bloodPressure: latest.bloodPressure || "—",
          temperature: latest.temperature
            ? `${latest.temperature}°F`
            : "—",
          lastCheckup: latest.lastCheckup
            ? new Date(latest.lastCheckup?.toDate?.() || Date.now()).toLocaleDateString()
            : "—",
        })
      }
    })

    // Medical Records listener
    const recordQuery = query(
      collection(db, "medical_records"),
      where("patientEmail", "==", user.email),
      orderBy("date", "desc")
    )
    const unsubRecords = onSnapshot(recordQuery, (snap) => {
      const recs = snap.docs.map((d) => {
        const data = d.data()
        return {
          type: data.type || "Record",
          doctor: data.doctorName || "—",
          date: new Date(data.date?.toDate?.() || Date.now()).toLocaleDateString(),
        }
      })
      setRecords(recs.slice(0, 5))
    })

    // Alerts listener
    const alertsQuery = query(
      collection(db, "health_alerts"),
      where("patientEmail", "==", user.email),
      orderBy("timestamp", "desc")
    )
    const unsubAlerts = onSnapshot(alertsQuery, (snap) => {
      const allAlerts = snap.docs.map((d) => {
        const data = d.data()
        return {
          title: data.title || "Alert",
          description: data.message || "",
          color: data.color || "blue",
        }
      })
      setAlerts(allAlerts.slice(0, 3))
    })

    return () => {
      unsubVitals()
      unsubRecords()
      unsubAlerts()
    }
  }, [user])

  const healthMetrics = [
    {
      label: "Heart Rate",
      value: metrics.heartRate,
      status: "Normal",
      icon: Heart,
      bgColor: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      label: "Blood Pressure",
      value: metrics.bloodPressure,
      status: "Normal",
      icon: TrendingUp,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Temperature",
      value: metrics.temperature,
      status: "Normal",
      icon: Heart,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      label: "Last Checkup",
      value: metrics.lastCheckup,
      status: "Recent",
      icon: Calendar,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome, {user?.email?.split("@")[0]}
        </h1>
        <p className="mt-2 text-secondary">Your health information at a glance</p>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {healthMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.label} className="card overflow-hidden p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-secondary">{metric.label}</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-xs text-green-600">{metric.status}</p>
                </div>
                <div className={`rounded-lg ${metric.bgColor} p-3`}>
                  <Icon className={`h-6 w-6 ${metric.iconColor}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Content */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Medical Records */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Recent Medical Records
          </h2>
          <div className="space-y-4">
            {records.length === 0 ? (
              <p className="text-secondary">No medical records found.</p>
            ) : (
              records.map((record, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-border pb-4 last:border-0 cursor-pointer hover:bg-surface-alt p-2 rounded transition-colors"
                  onClick={() => router.push("/patient/records")}
                >
                  <div>
                    <p className="font-medium text-foreground">{record.type}</p>
                    <p className="text-sm text-secondary">{record.doctor}</p>
                  </div>
                  <p className="text-xs text-secondary">{record.date}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Health Alerts */}
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Health Alerts</h2>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-secondary">No alerts at the moment.</p>
            ) : (
              alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 rounded-lg bg-${alert.color}-50 p-3 cursor-pointer hover:bg-${alert.color}-100 transition-colors`}
                  onClick={() => router.push("/patient/alerts")}
                >
                  <AlertCircle
                    className={`h-5 w-5 flex-shrink-0 text-${alert.color}-600`}
                  />
                  <div>
                    <p className={`text-sm font-medium text-${alert.color}-900`}>
                      {alert.title}
                    </p>
                    <p className={`text-xs text-${alert.color}-700`}>
                      {alert.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
