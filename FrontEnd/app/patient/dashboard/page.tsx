"use client"

import { Heart, TrendingUp, AlertCircle, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export default function PatientDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  const healthMetrics = [
    {
      label: "Heart Rate",
      value: "72 bpm",
      status: "Normal",
      icon: Heart,
      bgColor: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      label: "Blood Pressure",
      value: "120/80",
      status: "Normal",
      icon: TrendingUp,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Temperature",
      value: "98.6°F",
      status: "Normal",
      icon: Heart,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      label: "Last Checkup",
      value: "5 days ago",
      status: "Recent",
      icon: Calendar,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Welcome, {user?.email?.split("@")[0]}</h1>
        <p className="mt-2 text-secondary">Your health information at a glance</p>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {healthMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.label} className="card overflow-hidden p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-secondary">{metric.label}</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{metric.value}</p>
                  <p className="mt-1 text-xs text-green-600">{metric.status}</p>
                </div>
                <div className={`rounded-lg ${metric.bgColor} p-3`}>
                  <Icon className={`h-6 w-6 ${metric.iconColor}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Content */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Medical Records */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Medical Records</h2>
          <div className="space-y-4">
            {[
              { type: "Lab Results", date: "Oct 20, 2025", doctor: "Dr. Smith" },
              { type: "Prescription", date: "Oct 15, 2025", doctor: "Dr. Johnson" },
              { type: "Appointment Notes", date: "Oct 10, 2025", doctor: "Dr. Williams" },
            ].map((record, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border-b border-border pb-4 last:border-0 cursor-pointer hover:bg-surface-alt p-2 rounded transition-colors"
                onClick={() => router.push("/patient/records")}
              >
                <div>
                  <p className="font-medium text-foreground">{record.type}</p>
                  <p className="text-sm text-secondary">{record.doctor}</p>
                </div>
                <p className="text-xs text-secondary">{record.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Health Alerts */}
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Health Alerts</h2>
          <div className="space-y-3">
            <div
              className="flex gap-3 rounded-lg bg-blue-50 p-3 cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => router.push("/patient/alerts")}
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Medication Reminder</p>
                <p className="text-xs text-blue-700">Take your daily medication</p>
              </div>
            </div>
            <div
              className="flex gap-3 rounded-lg bg-green-50 p-3 cursor-pointer hover:bg-green-100 transition-colors"
              onClick={() => router.push("/patient/alerts")}
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Checkup Due</p>
                <p className="text-xs text-green-700">Schedule your annual checkup</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
