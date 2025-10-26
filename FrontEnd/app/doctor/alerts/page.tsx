"use client"

import { Topbar } from "@/components/topbar"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { db } from "@/firebase"
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  Timestamp,
  updateDoc,
  doc
} from "firebase/firestore"
import { useAuth } from "@/hooks/use-auth"

interface Alert {
  id: string
  type: string
  message: string
  severity: "high" | "medium" | "low"
  timestamp: string
  resolved: boolean
  doctorId: string
}

export default function DoctorAlerts() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return

    // Real-time listener for alerts
    const q = query(
      collection(db, 'alerts'),
      orderBy('timestamp', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alertsData: Alert[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        alertsData.push({
          id: doc.id,
          type: data.type,
          message: data.message,
          severity: data.severity,
          timestamp: data.timestamp?.toDate().toLocaleString() || new Date().toLocaleString(),
          resolved: data.resolved || false,
          doctorId: data.doctorId
        })
      })
      setAlerts(alertsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user?.id])

  const handleResolve = async (alertId: string) => {
    try {
      await updateDoc(doc(db, 'alerts', alertId), {
        resolved: true,
        resolvedAt: Timestamp.now(),
        resolvedBy: user?.id
      })
      
      // Create audit log
      await addDoc(collection(db, 'audit_logs'), {
        userId: user?.id,
        action: 'ALERT_RESOLVED',
        targetType: 'alert',
        targetId: alertId,
        timestamp: Timestamp.now(),
        ipAddress: 'N/A',
        userAgent: navigator.userAgent
      })
    } catch (error) {
      console.error('Error resolving alert:', error)
      alert('Failed to resolve alert')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Topbar title="Security Alerts" role="doctor" />
        <div className="p-8 flex justify-center items-center">
          <p className="text-secondary">Loading alerts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Topbar title="Security Alerts" role="doctor" />

      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <p className="text-sm text-secondary">Total Alerts</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{alerts.length}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-secondary">High Priority</p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {alerts.filter(a => a.severity === 'high' && !a.resolved).length}
            </p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-secondary">Pending</p>
            <p className="mt-2 text-3xl font-bold text-orange-600">
              {alerts.filter(a => !a.resolved).length}
            </p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-secondary">Resolved</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {alerts.filter(a => a.resolved).length}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="card p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-foreground font-semibold">No alerts at the moment</p>
              <p className="text-secondary text-sm mt-2">All systems are running smoothly</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`card p-6 border-l-4 ${
                  alert.resolved 
                    ? "border-green-500 opacity-60"
                    : alert.severity === "high"
                    ? "border-error"
                    : alert.severity === "medium"
                    ? "border-warning"
                    : "border-info"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`rounded-full p-2 ${
                        alert.resolved
                          ? "bg-green-100"
                          : alert.severity === "high"
                          ? "bg-error/20"
                          : alert.severity === "medium"
                          ? "bg-warning/20"
                          : "bg-info/20"
                      }`}
                    >
                      {alert.resolved ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <AlertCircle
                          className={`h-6 w-6 ${
                            alert.severity === "high"
                              ? "text-error"
                              : alert.severity === "medium"
                              ? "text-warning"
                              : "text-info"
                          }`}
                        />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{alert.type}</h3>
                        {alert.resolved && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Resolved
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-secondary">{alert.message}</p>
                      <p className="mt-2 text-xs text-secondary">{alert.timestamp}</p>
                    </div>
                  </div>
                  {!alert.resolved && (
                    <button 
                      onClick={() => handleResolve(alert.id)}
                      className="text-primary hover:underline"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}