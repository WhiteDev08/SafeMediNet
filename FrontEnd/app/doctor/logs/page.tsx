"use client"

import { Topbar } from "@/components/topbar"
import { AlertCircle } from "lucide-react"

const mockLogs = [
  {
    date: "2025-01-15 14:30",
    doctor: "Dr. Smith",
    patient: "John Doe",
    type: "View",
    status: "Success",
    ip: "192.168.1.1",
    device: "Desktop",
  },
  {
    date: "2025-01-15 13:15",
    doctor: "Dr. Johnson",
    patient: "Jane Smith",
    type: "Download",
    status: "Success",
    ip: "192.168.1.2",
    device: "Laptop",
  },
  {
    date: "2025-01-15 12:00",
    doctor: "Dr. Brown",
    patient: "Bob Johnson",
    type: "View",
    status: "Anomaly",
    ip: "203.0.113.45",
    device: "Unknown",
  },
  {
    date: "2025-01-15 11:45",
    doctor: "Dr. Davis",
    patient: "Alice Brown",
    type: "View",
    status: "Success",
    ip: "192.168.1.3",
    device: "Mobile",
  },
]

export default function DoctorLogs() {
  return (
    <div className="min-h-screen bg-background">
      <Topbar title="Access Logs & Alerts" role="doctor" />

      <div className="p-8">
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <p className="text-sm text-secondary">Total Access Events</p>
            <p className="mt-2 text-3xl font-bold text-foreground">1,247</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-secondary">Successful Access</p>
            <p className="mt-2 text-3xl font-bold text-success">1,235</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-secondary">Anomalies Detected</p>
            <p className="mt-2 text-3xl font-bold text-error">12</p>
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Access Log</h2>
            <button className="btn-primary text-sm">Download Logs</button>
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
                {mockLogs.map((log, idx) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
