"use client"

import { useState } from "react"
import { Download, Search } from "lucide-react"

export default function IoMTLogsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  const logs = [
    {
      id: "1",
      timestamp: "2025-10-23 14:32:15",
      device: "Heart Monitor - Patient 1",
      event: "Data Received",
      value: "72 bpm",
      status: "success",
    },
    {
      id: "2",
      timestamp: "2025-10-23 14:31:45",
      device: "BP Monitor - Patient 2",
      event: "Data Received",
      value: "120/80 mmHg",
      status: "success",
    },
    {
      id: "3",
      timestamp: "2025-10-23 14:30:20",
      device: "Thermometer - Patient 3",
      event: "Connection Lost",
      value: "N/A",
      status: "warning",
    },
    {
      id: "4",
      timestamp: "2025-10-23 14:29:55",
      device: "Multi-sensor - Patient 4",
      event: "Data Received",
      value: "Multiple readings",
      status: "success",
    },
    {
      id: "5",
      timestamp: "2025-10-23 14:28:30",
      device: "Heart Monitor - Patient 1",
      event: "Anomaly Detected",
      value: "Irregular pattern",
      status: "error",
    },
    {
      id: "6",
      timestamp: "2025-10-23 14:27:10",
      device: "BP Monitor - Patient 2",
      event: "Data Received",
      value: "118/78 mmHg",
      status: "success",
    },
  ]

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.event.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || log.status === filterType
    return matchesSearch && matchesFilter
  })

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
            <button className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2.5 font-medium text-blue-700 transition-all duration-200 hover:bg-blue-100">
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Device</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Event</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Value</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-border hover:bg-surface-alt transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground">{log.timestamp}</td>
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
              ))}
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
            {Math.round((logs.filter((l) => l.status === "success").length / logs.length) * 100)}%
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
