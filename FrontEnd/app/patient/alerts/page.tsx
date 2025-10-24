"use client"

import { AlertCircle, CheckCircle, Clock } from "lucide-react"

export default function PatientAlertsPage() {
  const alerts = [
    {
      id: "1",
      type: "Medication",
      title: "Take your daily medication",
      description: "It's time to take your blood pressure medication",
      severity: "info",
      time: "Today at 9:00 AM",
    },
    {
      id: "2",
      type: "Appointment",
      title: "Upcoming appointment",
      description: "You have an appointment with Dr. Smith tomorrow at 2:00 PM",
      severity: "info",
      time: "Tomorrow",
    },
    {
      id: "3",
      type: "Health",
      title: "Checkup reminder",
      description: "Your annual checkup is due soon",
      severity: "warning",
      time: "In 2 weeks",
    },
    {
      id: "4",
      type: "Lab",
      title: "Lab results available",
      description: "Your recent lab results are now available",
      severity: "success",
      time: "Oct 20, 2025",
    },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Health Alerts</h1>
        <p className="mt-2 text-secondary">Important health notifications and reminders</p>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert) => {
          const Icon = alert.severity === "success" ? CheckCircle : alert.severity === "warning" ? AlertCircle : Clock
          const bgColor =
            alert.severity === "success"
              ? "bg-green-50 border-green-200"
              : alert.severity === "warning"
                ? "bg-orange-50 border-orange-200"
                : "bg-blue-50 border-blue-200"
          const textColor =
            alert.severity === "success"
              ? "text-green-700"
              : alert.severity === "warning"
                ? "text-orange-700"
                : "text-blue-700"

          return (
            <div key={alert.id} className={`card border-2 p-6 ${bgColor}`}>
              <div className="flex gap-4">
                <Icon className={`h-6 w-6 flex-shrink-0 ${textColor}`} />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-semibold ${textColor}`}>{alert.title}</h3>
                      <p className="mt-1 text-sm text-secondary">{alert.description}</p>
                    </div>
                    <span className="text-xs text-secondary">{alert.time}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className={`rounded px-3 py-1 text-xs font-medium ${textColor} hover:opacity-80`}>
                      Acknowledge
                    </button>
                    <button className={`rounded px-3 py-1 text-xs font-medium ${textColor} hover:opacity-80`}>
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
