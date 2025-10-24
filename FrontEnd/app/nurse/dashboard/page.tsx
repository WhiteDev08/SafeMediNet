"use client"

import { BarChart3, Heart, Thermometer, Activity } from "lucide-react"

export default function NurseDashboard() {
  const stats = [
    { label: "Patients Monitored", value: "24", icon: Heart, color: "bg-blue-50" },
    { label: "Parameters Submitted", value: "156", icon: Activity, color: "bg-green-50" },
    { label: "Avg Temperature", value: "37.2°C", icon: Thermometer, color: "bg-orange-50" },
    { label: "Active Sessions", value: "8", icon: BarChart3, color: "bg-purple-50" },
  ]

  const recentSubmissions = [
    { patient: "John Doe", time: "2 mins ago", status: "Completed" },
    { patient: "Jane Smith", time: "15 mins ago", status: "Completed" },
    { patient: "Robert Johnson", time: "1 hour ago", status: "Completed" },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Nurse Dashboard</h1>
        <p className="mt-2 text-secondary">Monitor and submit IoMT device parameters</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className={`card p-6 ${stat.color}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-secondary">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <Icon className="h-8 w-8 text-primary opacity-20" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Submissions */}
      <div className="card p-6">
        <h2 className="mb-4 text-xl font-bold text-foreground">Recent Submissions</h2>
        <div className="space-y-3">
          {recentSubmissions.map((submission, idx) => (
            <div key={idx} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
              <div>
                <p className="font-semibold text-foreground">{submission.patient}</p>
                <p className="text-sm text-secondary">{submission.time}</p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                {submission.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action */}
      <div className="card border-2 border-dashed border-primary bg-primary/5 p-8 text-center">
        <Heart className="mx-auto mb-4 h-12 w-12 text-primary" />
        <h3 className="mb-2 text-lg font-bold text-foreground">Ready to Submit Parameters?</h3>
        <p className="mb-4 text-secondary">Go to IoMT Parameters to submit new medical data from devices</p>
        <a
          href="/nurse/vitals"
          className="inline-block rounded-lg bg-gradient-primary px-6 py-2 font-semibold text-white transition-all hover:shadow-lg"
        >
          Submit Parameters
        </a>
      </div>
    </div>
  )
}
