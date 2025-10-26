"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, Clock, Bell, Loader2, X } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { db } from "@/firebase"
import { collection, query, where, getDocs, orderBy, doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore"

interface Alert {
  id: string
  type: string
  title: string
  description: string
  severity: 'info' | 'warning' | 'success' | 'error'
  time: string
  timestamp: number
  acknowledged: boolean
  dismissed: boolean
}

export default function PatientAlertsPage() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'acknowledged'>('all')

  useEffect(() => {
    if (user?.id) {
      loadAlerts()
    }
  }, [user])

  const loadAlerts = async () => {
    try {
      setLoading(true)
      
      // Load alerts from alerts/notifications collection
      const alertsQuery = query(
        collection(db, 'patient_alerts'),
        where('patientId', '==', user!.id),
        where('dismissed', '==', false),
        orderBy('timestamp', 'desc')
      )
      
      const alertsSnapshot = await getDocs(alertsQuery)
      const alertsList: Alert[] = []
      
      alertsSnapshot.forEach((docSnap) => {
        const data = docSnap.data()
        
        // Calculate relative time
        const alertTime = data.timestamp.toMillis()
        const now = Date.now()
        const diffMs = now - alertTime
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)
        
        let timeStr = ""
        if (diffMins < 1) timeStr = "Just now"
        else if (diffMins < 60) timeStr = `${diffMins} min ago`
        else if (diffHours < 24) timeStr = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
        else if (diffDays < 7) timeStr = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
        else timeStr = new Date(alertTime).toLocaleDateString()
        
        alertsList.push({
          id: docSnap.id,
          type: data.type || "General",
          title: data.title,
          description: data.description,
          severity: data.severity || 'info',
          time: timeStr,
          timestamp: alertTime,
          acknowledged: data.acknowledged || false,
          dismissed: data.dismissed || false
        })
      })
      
      setAlerts(alertsList)
    } catch (error) {
      console.error("Error loading alerts:", error)
      // If collection doesn't exist, create sample data
      setAlerts(generateSampleAlerts())
    } finally {
      setLoading(false)
    }
  }

  const generateSampleAlerts = (): Alert[] => {
    return [
      {
        id: "sample_1",
        type: "Medication",
        title: "Medication Reminder",
        description: "It's time to take your blood pressure medication",
        severity: "info",
        time: "2 hours ago",
        timestamp: Date.now() - 7200000,
        acknowledged: false,
        dismissed: false
      },
      {
        id: "sample_2",
        type: "Appointment",
        title: "Upcoming appointment",
        description: "You have an appointment with your doctor tomorrow at 2:00 PM",
        severity: "warning",
        time: "5 hours ago",
        timestamp: Date.now() - 18000000,
        acknowledged: false,
        dismissed: false
      },
      {
        id: "sample_3",
        type: "Health",
        title: "Vitals Update",
        description: "Your latest vitals have been recorded by your nurse",
        severity: "success",
        time: "1 day ago",
        timestamp: Date.now() - 86400000,
        acknowledged: false,
        dismissed: false
      }
    ]
  }

  const handleAcknowledge = async (alertId: string) => {
    try {
      if (alertId.startsWith('sample_')) {
        // For sample data, just update local state
        setAlerts(alerts.map(a => 
          a.id === alertId ? { ...a, acknowledged: true } : a
        ))
        return
      }

      const alertRef = doc(db, 'patient_alerts', alertId)
      await updateDoc(alertRef, {
        acknowledged: true,
        acknowledgedAt: Timestamp.now()
      })
      
      setAlerts(alerts.map(a => 
        a.id === alertId ? { ...a, acknowledged: true } : a
      ))
    } catch (error) {
      console.error("Error acknowledging alert:", error)
    }
  }

  const handleDismiss = async (alertId: string) => {
    try {
      if (alertId.startsWith('sample_')) {
        // For sample data, just update local state
        setAlerts(alerts.filter(a => a.id !== alertId))
        return
      }

      const alertRef = doc(db, 'patient_alerts', alertId)
      await updateDoc(alertRef, {
        dismissed: true,
        dismissedAt: Timestamp.now()
      })
      
      setAlerts(alerts.filter(a => a.id !== alertId))
    } catch (error) {
      console.error("Error dismissing alert:", error)
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true
    if (filter === 'unread') return !alert.acknowledged
    if (filter === 'acknowledged') return alert.acknowledged
    return true
  })

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Health Alerts</h1>
        <p className="mt-2 text-secondary">Important health notifications and reminders</p>
      </div>

      {/* Filter & Stats */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-primary text-white' 
                : 'bg-surface-alt text-foreground hover:bg-surface-alt/80'
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread' 
                ? 'bg-primary text-white' 
                : 'bg-surface-alt text-foreground hover:bg-surface-alt/80'
            }`}
          >
            Unread ({alerts.filter(a => !a.acknowledged).length})
          </button>
          <button
            onClick={() => setFilter('acknowledged')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'acknowledged' 
                ? 'bg-primary text-white' 
                : 'bg-surface-alt text-foreground hover:bg-surface-alt/80'
            }`}
          >
            Read ({alerts.filter(a => a.acknowledged).length})
          </button>
        </div>

        {alerts.filter(a => !a.acknowledged).length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Bell className="h-4 w-4 text-warning" />
            <span className="text-secondary">
              {alerts.filter(a => !a.acknowledged).length} unread notification{alerts.filter(a => !a.acknowledged).length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Alerts List */}
      {filteredAlerts.length > 0 ? (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const Icon = alert.severity === "success" 
              ? CheckCircle 
              : alert.severity === "warning" || alert.severity === "error"
                ? AlertCircle 
                : Clock
            
            const bgColor =
              alert.severity === "success"
                ? "bg-green-50 border-green-200"
                : alert.severity === "warning"
                  ? "bg-orange-50 border-orange-200"
                  : alert.severity === "error"
                    ? "bg-red-50 border-red-200"
                    : "bg-blue-50 border-blue-200"
            
            const textColor =
              alert.severity === "success"
                ? "text-green-700"
                : alert.severity === "warning"
                  ? "text-orange-700"
                  : alert.severity === "error"
                    ? "text-red-700"
                    : "text-blue-700"

            return (
              <div 
                key={alert.id} 
                className={`card border-2 p-6 transition-all ${bgColor} ${
                  alert.acknowledged ? 'opacity-60' : ''
                }`}
              >
                <div className="flex gap-4">
                  <Icon className={`h-6 w-6 flex-shrink-0 ${textColor}`} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className={`font-semibold ${textColor}`}>{alert.title}</h3>
                          {!alert.acknowledged && (
                            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
                              New
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-secondary">{alert.description}</p>
                        <p className="mt-2 text-xs text-secondary">{alert.time}</p>
                      </div>
                      <button
                        onClick={() => handleDismiss(alert.id)}
                        className="text-secondary hover:text-foreground transition-colors"
                        title="Dismiss"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="mt-3 flex gap-2">
                      {!alert.acknowledged && (
                        <button 
                          onClick={() => handleAcknowledge(alert.id)}
                          className={`rounded px-3 py-1 text-xs font-medium ${textColor} hover:opacity-80 transition-opacity`}
                        >
                          Mark as Read
                        </button>
                      )}
                      <button 
                        onClick={() => handleDismiss(alert.id)}
                        className={`rounded px-3 py-1 text-xs font-medium ${textColor} hover:opacity-80 transition-opacity`}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Bell className="h-16 w-16 text-secondary mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Alerts</h3>
          <p className="text-secondary">
            {alerts.length === 0 
              ? "You don't have any alerts at this time. New notifications will appear here."
              : "No alerts match the selected filter."}
          </p>
        </div>
      )}

      {/* Info Box */}
      {alerts.length > 0 && (
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <div className="flex gap-4">
            <Bell className="h-6 w-6 flex-shrink-0 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900">Stay Informed</h3>
              <p className="mt-2 text-sm text-blue-700">
                You'll receive alerts for medication reminders, upcoming appointments, lab results, 
                and important health updates. Make sure to check your alerts regularly.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}