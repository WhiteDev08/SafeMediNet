"use client"

import { Topbar } from "@/components/topbar"
import { AlertCircle } from "lucide-react"

const mockAlerts = [
  {
    id: 1,
    type: "Anomaly",
    message: "Unusual access pattern detected from IP 203.0.113.45",
    severity: "high",
    timestamp: "2025-01-15 12:00",
  },
  {
    id: 2,
    type: "Warning",
    message: "Multiple failed access attempts detected",
    severity: "medium",
    timestamp: "2025-01-15 11:30",
  },
  {
    id: 3,
    type: "Info",
    message: "New device registered for patient access",
    severity: "low",
    timestamp: "2025-01-15 10:15",
  },
]

export default function DoctorAlerts() {
  return (
    <div className="min-h-screen bg-background">
      <Topbar title="Security Alerts" role="doctor" />

      <div className="p-8">
        <div className="space-y-4">
          {mockAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`card p-6 border-l-4 ${
                alert.severity === "high"
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
                      alert.severity === "high"
                        ? "bg-error/20"
                        : alert.severity === "medium"
                          ? "bg-warning/20"
                          : "bg-info/20"
                    }`}
                  >
                    <AlertCircle
                      className={`h-6 w-6 ${
                        alert.severity === "high"
                          ? "text-error"
                          : alert.severity === "medium"
                            ? "text-warning"
                            : "text-info"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{alert.type}</h3>
                    <p className="mt-1 text-secondary">{alert.message}</p>
                    <p className="mt-2 text-xs text-secondary">{alert.timestamp}</p>
                  </div>
                </div>
                <button className="text-primary hover:underline">Resolve</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
