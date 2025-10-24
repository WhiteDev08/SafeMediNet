"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface IoMTChartProps {
  data: Array<{
    time: string
    heartRate: number
    bloodPressure: number
    temperature: number
  }>
  title: string
}

export function IoMTChart({ data, title }: IoMTChartProps) {
  return (
    <div className="card p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="time" stroke="#666666" />
          <YAxis stroke="#666666" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e0e0e0",
              borderRadius: "0.5rem",
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="heartRate" stroke="#ef4444" name="Heart Rate (bpm)" strokeWidth={2} />
          <Line type="monotone" dataKey="bloodPressure" stroke="#3b82f6" name="Blood Pressure (mmHg)" strokeWidth={2} />
          <Line type="monotone" dataKey="temperature" stroke="#f97316" name="Temperature (°F)" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
