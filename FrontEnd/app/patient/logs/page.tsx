"use client"

import { useState, useEffect } from "react"
import { Topbar } from "@/components/topbar"
import { Loader2, Download } from "lucide-react"
import { db } from "@/firebase"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { useAuth } from "@/hooks/use-auth"

interface AccessLog {
  id: string
  date: string
  doctorName: string
  doctorId: string
  action: string
  status: string
  ipAddress: string
  timestamp: number
}

export default function PatientLogs() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<AccessLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'success' | 'denied'>('all')

  useEffect(() => {
    if (user?.id) {
      loadAccessLogs()
    }
  }, [user])

  const loadAccessLogs = async () => {
    try {
      setLoading(true)
      
      // Query access logs for this patient
      const logsQuery = query(
        collection(db, 'access_logs'),
        where('patientId', '==', user!.id),
        orderBy('timestamp', 'desc'),
        limit(100)
      )
      
      const logsSnapshot = await getDocs(logsQuery)
      
      const logsList: AccessLog[] = []
      
      for (const docSnap of logsSnapshot.docs) {
        const logData = docSnap.data()
        
        logsList.push({
          id: docSnap.id,
          date: new Date(logData.timestamp.toMillis()).toLocaleString(),
          doctorName: logData.doctorName || logData.doctorId,
          doctorId: logData.doctorId,
          action: logData.action || "View EHR",
          status: logData.status || "Success",
          ipAddress: logData.ipAddress || "N/A",
          timestamp: logData.timestamp.toMillis()
        })
      }
      
      setLogs(logsList)
    } catch (error) {
      console.error("Error loading access logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportLogs = () => {
    const csvContent = [
      ['Date', 'Doctor', 'Doctor ID', 'Action', 'Status', 'IP Address'].join(','),
      ...filteredLogs.map(log => 
        [log.date, log.doctorName, log.doctorId, log.action, log.status, log.ipAddress].join(',')
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `access_logs_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true
    if (filter === 'success') return log.status === 'Success'
    if (filter === 'denied') return log.status === 'Denied'
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Topbar title="Access Logs" role="patient" />
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Topbar title="Access Logs" role="patient" />

      <div className="p-8">
        <div className="card p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Your Access History</h2>
            <div className="flex gap-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Logs</option>
                <option value="success">Success Only</option>
                <option value="denied">Denied Only</option>
              </select>
              <button
                onClick={exportLogs}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                disabled={logs.length === 0}
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Doctor</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Action</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border hover:bg-surface-alt">
                    <td className="px-4 py-3 text-foreground">{log.date}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{log.doctorName}</p>
                        <p className="text-xs text-secondary">{log.doctorId}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{log.action}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          log.status === "Success" ? "bg-success/20 text-success" : "bg-error/20 text-error"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-secondary">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="py-8 text-center text-secondary">
              {logs.length === 0 ? "No access logs found" : "No logs match the selected filter"}
            </div>
          )}

          {logs.length > 0 && (
            <div className="mt-4 text-sm text-secondary">
              Showing {filteredLogs.length} of {logs.length} total logs
            </div>
          )}
        </div>
      </div>
    </div>
  )
}