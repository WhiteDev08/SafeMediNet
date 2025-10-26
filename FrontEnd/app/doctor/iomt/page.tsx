"use client"

import { useState, useEffect } from "react"
import { Activity, Zap, AlertCircle, TrendingUp } from "lucide-react"
import { IoMTChart } from "@/components/iomt-chart"
import { db, decryptData, getPatientVitals } from "@/firebase"
import { 
  collection, 
  query, 
  where, 
  getDocs,
  onSnapshot,
  orderBy,
  limit
} from "firebase/firestore"
import { useAuth } from "@/hooks/use-auth"

interface ChartDataPoint {
  time: string
  heartRate: number
  bloodPressure: number
  temperature: number
}

interface Device {
  id: string
  patientId: string
  patientName: string
  deviceType: string
  status: string
  lastReading: string
}

export default function DoctorIoMTPage() {
  const { user } = useAuth()
  const [isSimulating, setIsSimulating] = useState(false)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([
    { time: "00:00", heartRate: 72, bloodPressure: 120, temperature: 98.6 },
    { time: "04:00", heartRate: 68, bloodPressure: 118, temperature: 98.4 },
    { time: "08:00", heartRate: 75, bloodPressure: 122, temperature: 98.7 },
    { time: "12:00", heartRate: 80, bloodPressure: 125, temperature: 98.8 },
    { time: "16:00", heartRate: 78, bloodPressure: 123, temperature: 98.6 },
    { time: "20:00", heartRate: 74, bloodPressure: 121, temperature: 98.5 },
  ])
  const [devices, setDevices] = useState<Device[]>([])
  const [stats, setStats] = useState({
    activeDevices: 0,
    totalDevices: 0,
    alerts: 0,
    dataPoints: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    fetchDevicesAndVitals()
    setupRealTimeListener()
  }, [user?.id])

  const fetchDevicesAndVitals = async () => {
    try {
      // Fetch patients assigned to this doctor
      const patientsQuery = query(
        collection(db, 'patients'),
        where('assignedDoctor', '==', user?.id)
      )
      
      const patientsSnapshot = await getDocs(patientsQuery)
      const devicesData: Device[] = []
      let totalDataPoints = 0
      let alertCount = 0

      for (const patientDoc of patientsSnapshot.docs) {
        const patientData = patientDoc.data()
        
        // Get IoMT data for this patient
        const iomtQuery = query(
          collection(db, 'iomt_data'),
          where('patientId', '==', patientDoc.id),
          orderBy('timestamp', 'desc'),
          limit(1)
        )
        
        const iomtSnapshot = await getDocs(iomtQuery)
        
        if (!iomtSnapshot.empty) {
          const latestData = iomtSnapshot.docs[0].data()
          const timeDiff = Date.now() - latestData.timestamp?.toDate().getTime()
          const minutesAgo = Math.floor(timeDiff / 60000)
          
          const isActive = minutesAgo < 15
          
          devicesData.push({
            id: iomtSnapshot.docs[0].id,
            patientId: patientDoc.id,
            patientName: patientData.name,
            deviceType: latestData.deviceType || 'Multi-sensor',
            status: isActive ? 'Active' : 'Inactive',
            lastReading: minutesAgo < 1 ? '< 1 min ago' : `${minutesAgo} min ago`
          })

          // Count alerts (based on abnormal vitals)
          if (latestData.parametersEncrypted) {
            try {
              const vitals = decryptData(latestData.parametersEncrypted)
              if (vitals.heartRate > 100 || vitals.heartRate < 60) alertCount++
              if (vitals.systolicBP > 140 || vitals.systolicBP < 90) alertCount++
            } catch (e) {
              console.error('Error decrypting vitals:', e)
            }
          }
        }
      }

      // Get total data points
      const allIomtQuery = query(
        collection(db, 'iomt_data')
      )
      const allIomtSnapshot = await getDocs(allIomtQuery)
      totalDataPoints = allIomtSnapshot.size

      setDevices(devicesData)
      setStats({
        activeDevices: devicesData.filter(d => d.status === 'Active').length,
        totalDevices: devicesData.length,
        alerts: alertCount,
        dataPoints: totalDataPoints
      })
      setLoading(false)
    } catch (error) {
      console.error('Error fetching IoMT data:', error)
      setLoading(false)
    }
  }

  const setupRealTimeListener = () => {
    // Real-time listener for new IoMT data
    const iomtQuery = query(
      collection(db, 'iomt_data'),
      orderBy('timestamp', 'desc'),
      limit(10)
    )

    const unsubscribe = onSnapshot(iomtQuery, (snapshot) => {
      const newChartData: ChartDataPoint[] = []
      
      snapshot.forEach((doc) => {
        const data = doc.data()
        if (data.parametersEncrypted) {
          try {
            const vitals = decryptData(data.parametersEncrypted)
            const time = data.timestamp?.toDate().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
            
            newChartData.push({
              time: time || '',
              heartRate: vitals.heartRate || 0,
              bloodPressure: vitals.systolicBP || 0,
              temperature: vitals.temperature || 0
            })
          } catch (e) {
            console.error('Error processing vitals:', e)
          }
        }
      })

      if (newChartData.length > 0 && !isSimulating) {
        setChartData(newChartData.reverse())
      }
    })

    return unsubscribe
  }

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

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-secondary">Loading IoMT devices...</p>
      </div>
    )
  }

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
              <p className="mt-2 text-3xl font-bold text-foreground">{stats.activeDevices}</p>
            </div>
            <Activity className="h-6 w-6 text-green-500" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-secondary">Total Devices</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{stats.totalDevices}</p>
            </div>
            <Zap className="h-6 w-6 text-blue-500" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-secondary">Alerts</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{stats.alerts}</p>
            </div>
            <AlertCircle className="h-6 w-6 text-orange-500" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-secondary">Data Points</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{stats.dataPoints}</p>
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
          {devices.length === 0 ? (
            <p className="text-secondary text-center py-8">No devices found</p>
          ) : (
            devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{device.patientName} - {device.deviceType}</h3>
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
            ))
          )}
        </div>
      </div>
    </div>
  )
}