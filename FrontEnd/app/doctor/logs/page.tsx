"use client"

import { Topbar } from "@/components/topbar"
import { AlertCircle, Download } from "lucide-react"
import { useEffect, useState } from "react"
import { db } from "@/firebase"
import { 
  collection, 
  query, 
  orderBy, 
  getDocs,
  limit
} from "firebase/firestore"
import { useAuth } from "@/hooks/use-auth"

interface AccessLog {
  id: string
  date: string
  doctor: string
  patient: string
  type: string
  status: string
  ip: string
  device: string
}

export default function DoctorLogs() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<AccessLog[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    anomalies: 0
  })

  useEffect(() => {
    if (!user?.id) return
    fetchAccessLogs()
  }, [user?.id])

  const fetchAccessLogs = async () => {
    try {
      const logsQuery = query(
        collection(db, 'audit_logs'),
        orderBy('timestamp', 'desc'),
        limit(100)
      )
      
      const logsSnapshot = await getDocs(logsQuery)
      const logsData: AccessLog[] = []
      let successCount = 0
      let anomalyCount = 0

      logsSnapshot.forEach((doc) => {
        const data = doc.data()
        
        // Determine status based on action and other factors
        let status = data.status || 'Success'
        
        // Check for anomalies
        if (data.ipAddress && data.ipAddress.startsWith('203.0.113')) {
          status = 'Anomaly'
        }
        
        if (data.action?.includes('FAILED')) {
          status = 'Anomaly'
        }

        if (status === 'Success') successCount++
        if (status === 'Anomaly') anomalyCount++

        logsData.push({
          id: doc.id,
          date: data.timestamp?.toDate().toLocaleString() || 'N/A',
          doctor: data.userName || user?.name || 'Unknown',
          patient: data.patientName || 'N/A',
          type: data.action?.replace(/_/g, ' ') || 'View',
          status: status,
          ip: data.ipAddress || 'N/A',
          device: data.userAgent?.includes('Mobile') ? 'Mobile' : 
                  data.userAgent?.includes('Tablet') ? 'Tablet' : 
                  data.userAgent ? 'Desktop' : 'Unknown'
        })
      })

      setLogs(logsData)
      setStats({
        total: logsData.length,
        successful: successCount,
        anomalies: anomalyCount
      })
      setLoading(false)
    } catch (error) {
      console.error('Error fetching access logs:', error)
      setLoading(false)
    }
  }

  const exportLogs = () => {
    const csvContent = [
      ['Date', 'Doctor', 'Patient', 'Type', 'Status', 'IP', 'Device'],
      ...logs.map(log => [
        log.date,
        log.doctor,
        log.patient,
        log.type,
        log.status,
        log.ip,
        log.device
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `access-logs-${new Date().toISOString()}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Topbar title="Access Logs & Alerts" role="doctor" />
        <div className="p-8 flex justify-center items-center">
          <p className="text-secondary">Loading access logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Topbar title="Access Logs & Alerts" role="doctor" />

      <div className="p-8">
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <p className="text-sm text-secondary">Total Access Events</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-secondary">Successful Access</p>
            <p className="mt-2 text-3xl font-bold text-success">{stats.successful}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-secondary">Anomalies Detected</p>
            <p className="mt-2 text-3xl font-bold text-error">{stats.anomalies}</p>
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Access Log</h2>
            <button 
              onClick={exportLogs}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Logs
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Doctor</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Patient</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">IP</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Device</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-secondary">
                      No logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-border hover:bg-surface-alt ${log.status === "Anomaly" ? "bg-error/5" : ""}`}
                    >
                      <td className="px-4 py-3 text-foreground">{log.date}</td>
                      <td className="px-4 py-3 text-foreground">{log.doctor}</td>
                      <td className="px-4 py-3 text-foreground">{log.patient}</td>
                      <td className="px-4 py-3 text-foreground">{log.type}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                            log.status === "Anomaly" ? "bg-error/20 text-error" : "bg-success/20 text-success"
                          }`}
                        >
                          {log.status === "Anomaly" && <AlertCircle className="h-3 w-3" />}
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-secondary">{log.ip}</td>
                      <td className="px-4 py-3 text-secondary">{log.device}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}