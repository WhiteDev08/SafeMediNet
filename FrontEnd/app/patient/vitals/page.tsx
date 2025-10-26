"use client"

import { useState, useEffect } from "react"
import { Topbar } from "@/components/topbar"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Activity, Heart, Droplet, Wind, Thermometer, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getPatientVitals, decryptData } from "@/firebase"
import { db } from "@/firebase"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"

interface VitalsData {
  heartRate: number
  systolicBP: number
  diastolicBP: number
  temperature: number
  oxygenSaturation: number
  respiratoryRate: number
  bloodGlucose: number
  weight: number
  height: number
}

interface HistoricalData {
  date: string
  heartRate: number
  systolicBP: number
  bloodGlucose: number
  oxygenSaturation: number
  temperature: number
}

export default function PatientVitals() {
  const { user } = useAuth()
  const [currentVitals, setCurrentVitals] = useState<VitalsData | null>(null)
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week')

  useEffect(() => {
    if (user?.id) {
      loadVitalsData()
    }
  }, [user, timeRange])

  const loadVitalsData = async () => {
    try {
      setLoading(true)
      
      // Load current vitals
      const vitals = await getPatientVitals(user!.id)
      if (vitals) {
        setCurrentVitals(vitals)
      }
      
      // Load historical data from iomt_data collection
      const daysLimit = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365
      const historicalQuery = query(
        collection(db, 'iomt_data'),
        where('patientId', '==', user!.id),
        orderBy('timestamp', 'desc'),
        limit(daysLimit)
      )
      
      const historicalSnapshot = await getDocs(historicalQuery)
      const historical: HistoricalData[] = []
      
      historicalSnapshot.forEach((doc) => {
        const data = doc.data()
        try {
          if (data.parametersEncrypted) {
            const decryptedVitals = decryptData(data.parametersEncrypted) as VitalsData
            historical.push({
              date: new Date(data.timestamp.toMillis()).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              }),
              heartRate: decryptedVitals.heartRate,
              systolicBP: decryptedVitals.systolicBP,
              bloodGlucose: decryptedVitals.bloodGlucose,
              oxygenSaturation: decryptedVitals.oxygenSaturation,
              temperature: decryptedVitals.temperature
            })
          }
        } catch (error) {
          console.error("Error decrypting vitals:", error)
        }
      })
      
      // Reverse to show oldest to newest
      setHistoricalData(historical.reverse())
    } catch (error) {
      console.error("Error loading vitals data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getVitalStatus = (value: number, type: string) => {
    // Simple thresholds for demonstration
    switch (type) {
      case 'heartRate':
        if (value < 60 || value > 100) return 'text-error'
        return 'text-success'
      case 'systolicBP':
        if (value < 90 || value > 140) return 'text-error'
        if (value > 120) return 'text-warning'
        return 'text-success'
      case 'temperature':
        if (value < 36 || value > 37.5) return 'text-error'
        return 'text-success'
      case 'oxygenSaturation':
        if (value < 95) return 'text-error'
        return 'text-success'
      default:
        return 'text-foreground'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Topbar title="My Vitals" role="patient" />
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Topbar title="My Vitals" role="patient" />

      <div className="p-8">
        {/* Current Vitals Cards */}
        {currentVitals && (
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <span className="text-sm text-secondary">Heart Rate</span>
                </div>
              </div>
              <p className={`text-3xl font-bold ${getVitalStatus(currentVitals.heartRate, 'heartRate')}`}>
                {currentVitals.heartRate}
              </p>
              <p className="text-xs text-secondary mt-1">bpm</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span className="text-sm text-secondary">Blood Pressure</span>
                </div>
              </div>
              <p className={`text-3xl font-bold ${getVitalStatus(currentVitals.systolicBP, 'systolicBP')}`}>
                {currentVitals.systolicBP}/{currentVitals.diastolicBP}
              </p>
              <p className="text-xs text-secondary mt-1">mmHg</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-primary" />
                  <span className="text-sm text-secondary">Temperature</span>
                </div>
              </div>
              <p className={`text-3xl font-bold ${getVitalStatus(currentVitals.temperature, 'temperature')}`}>
                {currentVitals.temperature.toFixed(1)}
              </p>
              <p className="text-xs text-secondary mt-1">°C</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wind className="h-5 w-5 text-primary" />
                  <span className="text-sm text-secondary">Oxygen Sat.</span>
                </div>
              </div>
              <p className={`text-3xl font-bold ${getVitalStatus(currentVitals.oxygenSaturation, 'oxygenSaturation')}`}>
                {currentVitals.oxygenSaturation}
              </p>
              <p className="text-xs text-secondary mt-1">%</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-primary" />
                  <span className="text-sm text-secondary">Blood Glucose</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {currentVitals.bloodGlucose}
              </p>
              <p className="text-xs text-secondary mt-1">mg/dL</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span className="text-sm text-secondary">Respiratory Rate</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {currentVitals.respiratoryRate}
              </p>
              <p className="text-xs text-secondary mt-1">breaths/min</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span className="text-sm text-secondary">Weight</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {currentVitals.weight}
              </p>
              <p className="text-xs text-secondary mt-1">kg</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span className="text-sm text-secondary">Height</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {currentVitals.height}
              </p>
              <p className="text-xs text-secondary mt-1">cm</p>
            </div>
          </div>
        )}

        {!currentVitals && (
          <div className="card p-6 text-center mb-8">
            <p className="text-secondary">No current vitals data available</p>
          </div>
        )}

        {/* Historical Trends */}
        <div className="card p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Vitals Trends</h2>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>
          </div>

          {historicalData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" stroke="#666666" />
                <YAxis stroke="#666666" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="systolicBP" 
                  stroke="#00b8a9" 
                  strokeWidth={2} 
                  name="Blood Pressure (Systolic)" 
                />
                <Line 
                  type="monotone" 
                  dataKey="heartRate" 
                  stroke="#3f51b5" 
                  strokeWidth={2} 
                  name="Heart Rate" 
                />
                <Line 
                  type="monotone" 
                  dataKey="bloodGlucose" 
                  stroke="#ff9800" 
                  strokeWidth={2} 
                  name="Blood Glucose" 
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-12 text-center text-secondary">
              No historical data available for the selected time range
            </div>
          )}
        </div>
      </div>
    </div>
  )
}