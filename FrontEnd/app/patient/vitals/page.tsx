"use client"

import { Topbar } from "@/components/topbar"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const mockWeeklyData = [
  { day: "Mon", bp: 120, hr: 72, glucose: 95 },
  { day: "Tue", bp: 122, hr: 75, glucose: 98 },
  { day: "Wed", bp: 125, hr: 78, glucose: 102 },
  { day: "Thu", bp: 123, hr: 76, glucose: 100 },
  { day: "Fri", bp: 121, hr: 74, glucose: 97 },
  { day: "Sat", bp: 120, hr: 73, glucose: 95 },
  { day: "Sun", bp: 119, hr: 71, glucose: 93 },
]

export default function PatientVitals() {
  return (
    <div className="min-h-screen bg-background">
      <Topbar title="My Vitals" role="patient" />

      <div className="p-8">
        <div className="card p-6">
          <h2 className="mb-6 text-xl font-bold text-foreground">Weekly Vitals Overview</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={mockWeeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="day" stroke="#666666" />
              <YAxis stroke="#666666" />
              <Tooltip />
              <Line type="monotone" dataKey="bp" stroke="#00b8a9" strokeWidth={2} name="Blood Pressure" />
              <Line type="monotone" dataKey="hr" stroke="#3f51b5" strokeWidth={2} name="Heart Rate" />
              <Line type="monotone" dataKey="glucose" stroke="#ff9800" strokeWidth={2} name="Glucose" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
