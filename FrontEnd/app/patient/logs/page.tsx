"use client"

import { Topbar } from "@/components/topbar"

const mockLogs = [
  { date: "2025-01-15 10:30", doctor: "Dr. Michael Smith", action: "View EHR", status: "Success", ip: "192.168.1.1" },
  {
    date: "2025-01-14 14:15",
    doctor: "Dr. Sarah Johnson",
    action: "Download PDF",
    status: "Success",
    ip: "192.168.1.2",
  },
  { date: "2025-01-13 09:00", doctor: "Dr. Robert Brown", action: "View EHR", status: "Denied", ip: "203.0.113.45" },
]

export default function PatientLogs() {
  return (
    <div className="min-h-screen bg-background">
      <Topbar title="Access Logs" role="patient" />

      <div className="p-8">
        <div className="card p-6">
          <h2 className="mb-6 text-xl font-bold text-foreground">Your Access History</h2>
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
                {mockLogs.map((log, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-surface-alt">
                    <td className="px-4 py-3 text-foreground">{log.date}</td>
                    <td className="px-4 py-3 text-foreground">{log.doctor}</td>
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
                    <td className="px-4 py-3 text-secondary">{log.ip}</td>
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
