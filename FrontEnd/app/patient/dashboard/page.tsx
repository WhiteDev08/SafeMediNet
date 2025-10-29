"use client"

import { Heart, TrendingUp, AlertCircle, Calendar, Thermometer, Activity } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"
import { db, decryptData } from "@/firebase"
import { doc, getDoc, collection, onSnapshot, query, where, orderBy, limit } from "firebase/firestore"

interface VitalsMetrics {
  heartRate: string
  bloodPressure: string
  temperature: string
  oxygenSaturation: string
  respiratoryRate: string
  bloodGlucose: string
  lastUpdated: string
}

interface MedicalRecord {
  type: string
  date: string
  nurse: string
  deviceType: string
}

interface HealthAlert {
  title: string
  description: string
  severity: "low" | "medium" | "high"
}

export default function PatientDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  const [metrics, setMetrics] = useState<VitalsMetrics>({
    heartRate: "—",
    bloodPressure: "—",
    temperature: "—",
    oxygenSaturation: "—",
    respiratoryRate: "—",
    bloodGlucose: "—",
    lastUpdated: "—",
  })

  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [alerts, setAlerts] = useState<HealthAlert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return

    setLoading(true)

    // Listen to patient's own data
    const patientRef = doc(db, "patients", user.id)
    
    const unsubPatient = onSnapshot(patientRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        
        // Decrypt and display vitals
        if (data.vitalsEncrypted) {
          try {
            const vitals = await decryptData(data.vitalsEncrypted)
            setMetrics({
              heartRate: vitals.heartRate ? `${vitals.heartRate} bpm` : "—",
              bloodPressure: vitals.systolicBP && vitals.diastolicBP 
                ? `${vitals.systolicBP}/${vitals.diastolicBP}` 
                : "—",
              temperature: vitals.temperature ? `${vitals.temperature}°C` : "—",
              oxygenSaturation: vitals.oxygenSaturation ? `${vitals.oxygenSaturation}%` : "—",
              respiratoryRate: vitals.respiratoryRate ? `${vitals.respiratoryRate}/min` : "—",
              bloodGlucose: vitals.bloodGlucose ? `${vitals.bloodGlucose} mg/dL` : "—",
              lastUpdated: data.lastUpdated?.toDate?.()
                ? new Date(data.lastUpdated.toDate()).toLocaleString()
                : "—",
            })
          } catch (error) {
            console.error('Error decrypting vitals:', error)
          }
        }

        // Check for security alerts based on session state
        const sessionState = data.session_state || {}
        const newAlerts: HealthAlert[] = []

        if (sessionState.login_suspicion === "high" || data.threatLevel === "high") {
          newAlerts.push({
            title: "Security Alert",
            description: sessionState.login_message || "Unusual login activity detected",
            severity: "high"
          })
        } else if (sessionState.login_suspicion === "medium" || data.threatLevel === "medium") {
          newAlerts.push({
            title: "Security Notice",
            description: "Please verify recent account activity",
            severity: "medium"
          })
        }

        // Check vitals for health alerts
        if (data.vitalsEncrypted) {
          try {
            const vitals = await decryptData(data.vitalsEncrypted)
            
            if (vitals.heartRate > 100 || vitals.heartRate < 60) {
              newAlerts.push({
                title: "Heart Rate Alert",
                description: `Your heart rate is ${vitals.heartRate} bpm`,
                severity: vitals.heartRate > 120 || vitals.heartRate < 50 ? "high" : "medium"
              })
            }

            if (vitals.temperature > 37.5) {
              newAlerts.push({
                title: "Temperature Alert",
                description: `Your temperature is ${vitals.temperature}°C`,
                severity: vitals.temperature > 38.5 ? "high" : "medium"
              })
            }

            if (vitals.oxygenSaturation < 95) {
              newAlerts.push({
                title: "Oxygen Saturation Alert",
                description: `Your oxygen level is ${vitals.oxygenSaturation}%`,
                severity: vitals.oxygenSaturation < 90 ? "high" : "medium"
              })
            }
          } catch (error) {
            console.error('Error checking vitals for alerts:', error)
          }
        }

        setAlerts(newAlerts)
      }
      setLoading(false)
    })

    // Listen to medical records (iomt_data)
    const recordsQuery = query(
      collection(db, "iomt_data"),
      where("patientId", "==", user.id),
      orderBy("timestamp", "desc"),
      limit(5)
    )

    const unsubRecords = onSnapshot(recordsQuery, async (snapshot) => {
      const recs: MedicalRecord[] = []
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data()
        
        // Get nurse name
        let nurseName = data.nurseId
        try {
          const nurseRef = doc(db, "nurses", data.nurseId)
          const nurseDoc = await getDoc(nurseRef)
          if (nurseDoc.exists()) {
            nurseName = nurseDoc.data().name || data.nurseId
          }
        } catch (error) {
          console.error('Error fetching nurse:', error)
        }

        recs.push({
          type: "Vitals Update",
          nurse: nurseName,
          deviceType: data.deviceType || "Manual Update",
          date: data.timestamp?.toDate?.()
            ? new Date(data.timestamp.toDate()).toLocaleDateString()
            : "Recently",
        })
      }
      
      setRecords(recs)
    })

    return () => {
      unsubPatient()
      unsubRecords()
    }
  }, [user])

  const healthMetrics = [
    {
      label: "Heart Rate",
      value: metrics.heartRate,
      icon: Heart,
      bgColor: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      label: "Blood Pressure",
      value: metrics.bloodPressure,
      icon: TrendingUp,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Temperature",
      value: metrics.temperature,
      icon: Thermometer,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      label: "Oxygen Saturation",
      value: metrics.oxygenSaturation,
      icon: Activity,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
  ]

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "high": return { bg: "bg-red-50", text: "text-red-900", subtext: "text-red-700", icon: "text-red-600", hover: "hover:bg-red-100" }
      case "medium": return { bg: "bg-orange-50", text: "text-orange-900", subtext: "text-orange-700", icon: "text-orange-600", hover: "hover:bg-orange-100" }
      default: return { bg: "bg-blue-50", text: "text-blue-900", subtext: "text-blue-700", icon: "text-blue-600", hover: "hover:bg-blue-100" }
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome, {user?.name || user?.email?.split("@")[0]}
        </h1>
        <p className="mt-2 text-secondary">Your health information at a glance</p>
        {metrics.lastUpdated !== "—" && (
          <p className="mt-1 text-xs text-secondary">Last updated: {metrics.lastUpdated}</p>
        )}
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
                    {loading ? "..." : metric.value}
                  </p>
                </div>
                <div className={`rounded-lg ${metric.bgColor} p-3`}>
                  <Icon className={`h-6 w-6 ${metric.iconColor}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Additional Vitals */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="card p-4">
          <p className="text-sm text-secondary">Respiratory Rate</p>
          <p className="mt-1 text-xl font-bold text-foreground">
            {loading ? "..." : metrics.respiratoryRate}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-secondary">Blood Glucose</p>
          <p className="mt-1 text-xl font-bold text-foreground">
            {loading ? "..." : metrics.bloodGlucose}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-secondary">Last Checkup</p>
          <p className="mt-1 text-xl font-bold text-foreground">
            {loading ? "..." : metrics.lastUpdated !== "—" ? metrics.lastUpdated.split(",")[0] : "—"}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Medical Records */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Recent Medical Records
          </h2>
          <div className="space-y-4">
            {loading ? (
              <p className="text-secondary">Loading records...</p>
            ) : records.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-secondary">No medical records found.</p>
                <p className="text-sm text-secondary mt-1">Records will appear here after vitals updates.</p>
              </div>
            ) : (
              records.map((record, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-border pb-4 last:border-0 cursor-pointer hover:bg-surface-alt p-2 rounded transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">{record.type}</p>
                    <p className="text-sm text-secondary">by {record.nurse}</p>
                    <p className="text-xs text-secondary">{record.deviceType}</p>
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
            {loading ? (
              <p className="text-secondary">Loading alerts...</p>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="mx-auto h-12 w-12 text-green-400 mb-2" />
                <p className="text-green-600 font-medium">All Clear!</p>
                <p className="text-sm text-secondary mt-1">No health alerts at the moment.</p>
              </div>
            ) : (
              alerts.map((alert, idx) => {
                const colors = getAlertColor(alert.severity)
                return (
                  <div
                    key={idx}
                    className={`flex gap-3 rounded-lg ${colors.bg} p-3 cursor-pointer ${colors.hover} transition-colors`}
                  >
                    <AlertCircle
                      className={`h-5 w-5 flex-shrink-0 ${colors.icon}`}
                    />
                    <div>
                      <p className={`text-sm font-medium ${colors.text}`}>
                        {alert.title}
                      </p>
                      <p className={`text-xs ${colors.subtext}`}>
                        {alert.description}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}