"use client"

import { useState, useEffect } from "react"
import { Download, Search } from "lucide-react"
import { db, decryptData } from "@/firebase"
import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit
} from "firebase/firestore"
import { useAuth } from "@/hooks/use-auth"

interface IoMTLog {
  id: string
  timestamp: string
  device: string
  patientName: string
  event: string
  value: string
  status: "success" | "warning" | "error"
}

export default function IoMTLogsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [logs, setLogs] = useState<IoMTLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    fetchIoMTLogs()
  }, [user?.id])

  const fetchIoMTLogs = async () => {
    try {
      // First, get all patients assigned to this doctor
      const patientsQuery = query(
        collection(db, 'patients'),
        where('assignedDoctor', '==', user?.id)
      )
      
      const patientsSnapshot = await getDocs(patientsQuery)
      const patientMap = new Map()
      
      patientsSnapshot.forEach((doc) => {
        patientMap.set(doc.id, doc.data().name)
      })

      // Fetch IoMT data logs
      const iomtQuery = query(
        collection(db, 'iomt_data'),
        orderBy('timestamp', 'desc'),
        limit(50)
      )
      
      const iomtSnapshot = await getDocs(iomtQuery)
      const logsData: IoMTLog[] = []

      iomtSnapshot.forEach((doc) => {
        const data = doc.data()
        
        // Only include logs for doctor's patients
        if (!patientMap.has(data.patientId)) return

        let eventType = 'Data Received'
        let value = 'N/A'
        let status: "success" | "warning" | "error" = 'success'

        // Decrypt and analyze vitals
        if (data.parametersEncrypted) {
          try {
            const vitals = decryptData(data.parametersEncrypted)
            value = `HR: ${vitals.heartRate} bpm, BP: ${vitals.systolicBP}/${vitals.diastolicBP} mmHg`
            
            // Check for anomalies
            if (vitals.heartRate > 100 || vitals.heartRate < 60) {
              eventType = 'Anomaly Detected'
              status = 'error'
              value = `Irregular heart rate: ${vitals.heartRate} bpm`
            } else if (vitals.systolicBP > 140 || vitals.systolicBP < 90) {
              eventType = 'Warning'
              status = 'warning'
              value = `BP alert: ${vitals.systolicBP}/${vitals.diastolicBP} mmHg`
            }
          } catch (e) {
            eventType = 'Decryption Error'
            status = 'error'
          }
        }

        // Check for connection issues
        const timeDiff = Date.now() - data.timestamp?.toDate().getTime()
        if (timeDiff > 900000) { // 15 minutes
          eventType = 'Connection Lost'
          status = 'warning'
          value = 'Device offline'
        }

        logsData.push({
          id: doc.id,
          timestamp: data.timestamp?.toDate().toLocaleString() || 'N/A',
          device: `${data.deviceType || 'Multi-sensor'}`,
          patientName: patientMap.get(data.patientId) || 'Unknown',
          event: eventType,
          value: value,
          status: status
        })
      })

      setLogs(logsData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching IoMT logs:', error)
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.patientName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || log.status === filterType
    return matchesSearch && matchesFilter
  })

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Patient', 'Device', 'Event', 'Value', 'Status'],
      ...filteredLogs.map(log => [
        log.timestamp,
        log.patientName,
        log.device,
        log.event,
        log.value,
        log.status
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `iomt-logs-${new Date().toISOString()}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-secondary">Loading IoMT logs...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">IoMT Device Logs</h1>
        <p className="mt-2 text-secondary">View and analyze device activity and events</p>
      </div>

      {/* Controls */}
      <div className="card mb-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-field">
              <option value="all">All Events</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
            <button 
              onClick={exportLogs}
              className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2.5 font-medium text-blue-700 transition-all duration-200 hover:bg-blue-100"
            >
              <Download className="h-5 w-5" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-alt">
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Timestamp</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Patient</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Device</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Event</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Value</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-secondary">
                    No logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border hover:bg-surface-alt transition-colors">
                    <td className="px-6 py-4 text-sm text-foreground">{log.timestamp}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{log.patientName}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{log.device}</td>
                    <td className="px-6 py-4 text-sm text-secondary">{log.event}</td>
                    <td className="px-6 py-4 text-sm text-secondary">{log.value}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                          log.status === "success"
                            ? "bg-green-100 text-green-700"
                            : log.status === "warning"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="card p-6">
          <p className="text-sm text-secondary">Total Events</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{logs.length}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-secondary">Success Rate</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {logs.length > 0 ? Math.round((logs.filter((l) => l.status === "success").length / logs.length) * 100) : 0}%
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-secondary">Alerts</p>
          <p className="mt-2 text-3xl font-bold text-orange-600">{logs.filter((l) => l.status !== "success").length}</p>
        </div>
      </div>
    </div>
  )
}