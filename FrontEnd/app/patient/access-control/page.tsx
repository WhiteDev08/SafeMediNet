"use client"

import { useState, useEffect } from "react"
import { Topbar } from "@/components/topbar"
import { Shield, Loader2 } from "lucide-react"
import { db } from "@/firebase"
import { doc, getDoc, updateDoc, collection, query, where, getDocs, Timestamp } from "firebase/firestore"
import { useAuth } from "@/hooks/use-auth"

interface Doctor {
  id: string
  name: string
  hasAccess: boolean
  lastAccess: string
  email?: string
  department?: string
}

export default function PatientAccessControl() {
  const { user } = useAuth()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [showConfirm, setShowConfirm] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadDoctors()
    }
  }, [user])

  const loadDoctors = async () => {
    try {
      setLoading(true)
      
      // Get patient data to find assigned doctors
      const patientRef = doc(db, 'patients', user!.id)
      const patientDoc = await getDoc(patientRef)
      
      if (!patientDoc.exists()) {
        console.error("Patient not found")
        return
      }

      const patientData = patientDoc.data()
      
      // Get all doctors from the system
      const doctorsQuery = query(collection(db, 'doctors'))
      const doctorsSnapshot = await getDocs(doctorsQuery)
      
      const doctorsList: Doctor[] = []
      
      for (const docSnap of doctorsSnapshot.docs) {
        const doctorData = docSnap.data()
        const doctorId = docSnap.id
        
        // Check if this doctor has access to this patient
        const hasAccess = patientData.authorizedDoctors?.includes(doctorId) || 
                         patientData.assignedDoctor === doctorId
        
        // Get last access from access logs
        let lastAccess = "Never"
        try {
          const logsQuery = query(
            collection(db, 'access_logs'),
            where('patientId', '==', user!.id),
            where('doctorId', '==', doctorId),
            where('status', '==', 'Success')
          )
          const logsSnapshot = await getDocs(logsQuery)
          
          if (!logsSnapshot.empty) {
            // Get the most recent log
            const logs = logsSnapshot.docs.map(doc => doc.data())
            logs.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis())
            const lastLog = logs[0]
            lastAccess = new Date(lastLog.timestamp.toMillis()).toLocaleString()
          }
        } catch (error) {
          console.error("Error fetching access logs:", error)
        }
        
        doctorsList.push({
          id: doctorId,
          name: doctorData.name,
          hasAccess,
          lastAccess,
          email: doctorData.email,
          department: doctorData.department
        })
      }
      
      setDoctors(doctorsList)
    } catch (error) {
      console.error("Error loading doctors:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAccess = async (doctorId: string) => {
    try {
      setActionLoading(true)
      
      const doctor = doctors.find(d => d.id === doctorId)
      if (!doctor) return
      
      const patientRef = doc(db, 'patients', user!.id)
      const patientDoc = await getDoc(patientRef)
      
      if (!patientDoc.exists()) return
      
      const patientData = patientDoc.data()
      let authorizedDoctors = patientData.authorizedDoctors || []
      
      if (doctor.hasAccess) {
        // Revoke access
        authorizedDoctors = authorizedDoctors.filter((id: string) => id !== doctorId)
      } else {
        // Grant access
        if (!authorizedDoctors.includes(doctorId)) {
          authorizedDoctors.push(doctorId)
        }
      }
      
      await updateDoc(patientRef, {
        authorizedDoctors,
        lastUpdated: Timestamp.now()
      })
      
      // Update local state
      setDoctors(doctors.map(d => 
        d.id === doctorId ? { ...d, hasAccess: !d.hasAccess } : d
      ))
      
      setShowConfirm(null)
    } catch (error) {
      console.error("Error toggling access:", error)
      alert("Failed to update access. Please try again.")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Topbar title="Access Control" role="patient" />
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Topbar title="Access Control" role="patient" />

      <div className="p-8">
        <div className="card p-6">
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-info/10 p-4">
            <Shield className="h-5 w-5 text-info" />
            <p className="text-sm text-info">You control who views your medical records.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Doctor</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Department</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Access</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Last Access</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor.id} className="border-b border-border hover:bg-surface-alt">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{doctor.name}</p>
                        <p className="text-xs text-secondary">{doctor.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-secondary">{doctor.department || "N/A"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          doctor.hasAccess ? "bg-success/20 text-success" : "bg-error/20 text-error"
                        }`}
                      >
                        {doctor.hasAccess ? "Granted" : "Revoked"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-secondary">{doctor.lastAccess}</td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => setShowConfirm(doctor.id)} 
                        className="text-primary hover:underline disabled:opacity-50"
                        disabled={actionLoading}
                      >
                        {doctor.hasAccess ? "Revoke" : "Grant"}
                      </button>
                      {showConfirm === doctor.id && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                          <div className="card p-6 max-w-sm">
                            <h3 className="font-semibold text-foreground">Confirm Action</h3>
                            <p className="mt-2 text-sm text-secondary">
                              {doctor.hasAccess ? "Revoke" : "Grant"} access for {doctor.name}?
                            </p>
                            <div className="mt-4 flex gap-3">
                              <button 
                                onClick={() => setShowConfirm(null)} 
                                className="btn-secondary flex-1"
                                disabled={actionLoading}
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => toggleAccess(doctor.id)} 
                                className="btn-primary flex-1 flex items-center justify-center gap-2"
                                disabled={actionLoading}
                              >
                                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                Confirm
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {doctors.length === 0 && (
            <div className="py-8 text-center text-secondary">
              No doctors found in the system
            </div>
          )}
        </div>
      </div>
    </div>
  )
}