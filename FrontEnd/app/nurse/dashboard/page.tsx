"use client"

import { useEffect, useState } from "react"
import { BarChart3, Heart, Thermometer, Activity } from "lucide-react"
import { db } from "@/firebase" // ✅ path to your firebase.ts
import { collection, onSnapshot, query, orderBy } from "firebase/firestore"

export default function NurseDashboard() {
  const [stats, setStats] = useState({
    patientsMonitored: 0,
    parametersSubmitted: 0,
    avgTemperature: 0,
    activeSessions: 0,
  })

  const [recentSubmissions, setRecentSubmissions] = useState<
    { patient: string; time: string; status: string }[]
  >([])

  // 🔥 Listen to Firestore updates in real time
  useEffect(() => {
    const q = query(collection(db, "submissions"), orderBy("timestamp", "desc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const submissions: any[] = []
      let totalTemp = 0
      let completedCount = 0
      const patientSet = new Set()

      snapshot.forEach((doc) => {
        const data = doc.data()
        submissions.push({
          patient: data.patientName || "Unknown",
          time: new Date(data.timestamp?.toDate?.() || Date.now()).toLocaleTimeString(),
          status: data.status || "Pending",
        })

        if (data.temperature) {
          totalTemp += Number(data.temperature)
          completedCount++
        }
        if (data.patientName) patientSet.add(data.patientName)
      })

      const avgTemp = completedCount > 0 ? (totalTemp / completedCount).toFixed(1) : 0

      setRecentSubmissions(submissions.slice(0, 5))
      setStats({
        patientsMonitored: patientSet.size,
        parametersSubmitted: snapshot.size,
        avgTemperature: Number(avgTemp),
        activeSessions: Math.floor(Math.random() * 10) + 1, // Optional dynamic placeholder
      })
    })

    return () => unsubscribe()
  }, [])

  const statCards = [
    { label: "Patients Monitored", value: stats.patientsMonitored, icon: Heart, color: "bg-blue-50" },
    { label: "Parameters Submitted", value: stats.parametersSubmitted, icon: Activity, color: "bg-green-50" },
    { label: "Avg Temperature", value: `${stats.avgTemperature}°C`, icon: Thermometer, color: "bg-orange-50" },
    { label: "Active Sessions", value: stats.activeSessions, icon: BarChart3, color: "bg-purple-50" },
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
        {statCards.map((stat) => {
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
          {recentSubmissions.length === 0 ? (
            <p className="text-secondary">No recent submissions found.</p>
          ) : (
            recentSubmissions.map((submission, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <div>
                  <p className="font-semibold text-foreground">{submission.patient}</p>
                  <p className="text-sm text-secondary">{submission.time}</p>
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  {submission.status}
                </span>
              </div>
            ))
          )}
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
