"use client"

import { useState, useEffect } from "react"
import { Activity, Zap, AlertCircle, TrendingUp } from "lucide-react"
import { IoMTChart } from "@/components/iomt-chart"

export default function DoctorIoMTPage() {
  const [isSimulating, setIsSimulating] = useState(false)
  const [chartData, setChartData] = useState([
    { time: "00:00", heartRate: 72, bloodPressure: 120, temperature: 98.6 },
    { time: "04:00", heartRate: 68, bloodPressure: 118, temperature: 98.4 },
    { time: "08:00", heartRate: 75, bloodPressure: 122, temperature: 98.7 },
    { time: "12:00", heartRate: 80, bloodPressure: 125, temperature: 98.8 },
    { time: "16:00", heartRate: 78, bloodPressure: 123, temperature: 98.6 },
    { time: "20:00", heartRate: 74, bloodPressure: 121, temperature: 98.5 },
  ])

  useEffect(() => {
    if (!isSimulating) return

    const interval = setInterval(() => {
      setChartData((prev) => {
        const newData = [...prev.slice(1)]
        const lastTime = Number.parseInt(prev[prev.length - 1].time)
        const newTime = ((lastTime + 4) % 24).toString().padStart(2, "0") + ":00"

        newData.push({
          time: newTime,
          heartRate: Math.floor(Math.random() * 30 + 65),
          bloodPressure: Math.floor(Math.random() * 20 + 110),
          temperature: Math.random() * 2 + 97.5,
        })
        return newData
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [isSimulating])

  const devices = [
    { id: "1", name: "Patient 1 - Heart Monitor", status: "Active", lastReading: "2 min ago" },
    { id: "2", name: "Patient 2 - BP Monitor", status: "Active", lastReading: "1 min ago" },
    { id: "3", name: "Patient 3 - Thermometer", status: "Inactive", lastReading: "15 min ago" },
    { id: "4", name: "Patient 4 - Multi-sensor", status: "Active", lastReading: "30 sec ago" },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">IoMT Device Monitoring</h1>
        <p className="mt-2 text-secondary">Real-time monitoring of Internet of Medical Things devices</p>
      </div>

      {/* Control Panel */}
      <div className="card mb-8 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Simulation Control</h2>
            <p className="mt-1 text-sm text-secondary">Toggle real-time data simulation</p>
          </div>
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`rounded-lg px-6 py-2.5 font-semibold text-white transition-all duration-300 ${
              isSimulating ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isSimulating ? "Stop Simulation" : "Start Simulation"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-secondary">Active Devices</p>
              <p className="mt-2 text-3xl font-bold text-foreground">3</p>
            </div>
            <Activity className="h-6 w-6 text-green-500" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-secondary">Total Devices</p>
              <p className="mt-2 text-3xl font-bold text-foreground">4</p>
            </div>
            <Zap className="h-6 w-6 text-blue-500" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-secondary">Alerts</p>
              <p className="mt-2 text-3xl font-bold text-foreground">1</p>
            </div>
            <AlertCircle className="h-6 w-6 text-orange-500" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-secondary">Data Points</p>
              <p className="mt-2 text-3xl font-bold text-foreground">1.2K</p>
            </div>
            <TrendingUp className="h-6 w-6 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-8">
        <IoMTChart data={chartData} title="Real-Time Vital Signs" />
      </div>

      {/* Devices List */}
      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Connected Devices</h2>
        <div className="space-y-3">
          {devices.map((device) => (
            <div key={device.id} className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex-1">
                <h3 className="font-medium text-foreground">{device.name}</h3>
                <p className="text-sm text-secondary">Last reading: {device.lastReading}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                    device.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {device.status}
                </span>
                <div
                  className={`h-3 w-3 rounded-full ${device.status === "Active" ? "bg-green-500" : "bg-gray-400"}`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
