"use client"

import { useState, useEffect } from "react"
import { User, Mail, Phone, Heart, Calendar, Loader2, Shield } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { db } from "@/firebase"
import { doc, getDoc } from "firebase/firestore"

interface PatientData {
  id: string
  name: string
  email: string
  phone: string
  dob: string
  bloodType: string
  assignedDoctor: string
  assignedNurse: string
  lastUpdated?: any
  doctorName?: string
  nurseName?: string
}

export default function PatientProfilePage() {
  const { user } = useAuth()
  const [patientData, setPatientData] = useState<PatientData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadPatientProfile()
    }
  }, [user])

  const loadPatientProfile = async () => {
    try {
      setLoading(true)
      
      // Get patient data
      const patientRef = doc(db, 'patients', user!.id)
      const patientDoc = await getDoc(patientRef)
      
      if (!patientDoc.exists()) {
        console.error("Patient not found")
        return
      }
      
      const data = patientDoc.data()
      
      // Get assigned doctor name
      let doctorName = "Not Assigned"
      if (data.assignedDoctor) {
        try {
          const doctorRef = doc(db, 'doctors', data.assignedDoctor)
          const doctorDoc = await getDoc(doctorRef)
          if (doctorDoc.exists()) {
            doctorName = doctorDoc.data().name
          }
        } catch (error) {
          console.error("Error fetching doctor:", error)
        }
      }
      
      // Get assigned nurse name
      let nurseName = "Not Assigned"
      if (data.assignedNurse) {
        try {
          const nurseRef = doc(db, 'nurses', data.assignedNurse)
          const nurseDoc = await getDoc(nurseRef)
          if (nurseDoc.exists()) {
            nurseName = nurseDoc.data().name
          }
        } catch (error) {
          console.error("Error fetching nurse:", error)
        }
      }
      
      setPatientData({
        id: patientDoc.id,
        name: data.name,
        email: data.email,
        phone: data.phone || "Not Provided",
        dob: data.dob || "Not Provided",
        bloodType: data.bloodType || "Unknown",
        assignedDoctor: data.assignedDoctor || "",
        assignedNurse: data.assignedNurse || "",
        lastUpdated: data.lastUpdated,
        doctorName,
        nurseName
      })
    } catch (error) {
      console.error("Error loading patient profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "Not Provided") return dateString
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const getTimeSinceUpdate = () => {
    if (!patientData?.lastUpdated) return "Never"
    
    try {
      const lastUpdate = patientData.lastUpdated.toMillis()
      const now = Date.now()
      const diffMs = now - lastUpdate
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return "Today"
      if (diffDays === 1) return "1 day ago"
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
      return `${Math.floor(diffDays / 30)} months ago`
    } catch {
      return "Unknown"
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!patientData) {
    return (
      <div className="p-8">
        <div className="card p-6 text-center">
          <p className="text-error">Failed to load patient profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="mt-2 text-secondary">View your personal health information</p>
      </div>

      {/* Profile Card */}
      <div className="card p-8">
        <div className="flex flex-col items-center md:flex-row md:items-start md:gap-8">
          {/* Avatar */}
          <div className="mb-6 flex flex-col items-center md:mb-0">
            <div className="mb-4 h-24 w-24 rounded-full bg-gradient-primary flex items-center justify-center">
              <User className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">{patientData.name}</h2>
            <p className="text-secondary">Patient ID: {patientData.id}</p>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-secondary">Email</p>
                  <p className="font-medium text-foreground">{patientData.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-secondary">Phone</p>
                  <p className="font-medium text-foreground">{patientData.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-secondary">Blood Type</p>
                  <p className="font-medium text-foreground">{patientData.bloodType}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-secondary">Date of Birth</p>
                  <p className="font-medium text-foreground">{formatDate(patientData.dob)}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="mb-3 font-semibold text-foreground">Care Team</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-surface-alt p-4">
                  <p className="text-sm text-secondary">Assigned Doctor</p>
                  <p className="mt-1 font-medium text-foreground">{patientData.doctorName}</p>
                </div>
                <div className="rounded-lg bg-surface-alt p-4">
                  <p className="text-sm text-secondary">Assigned Nurse</p>
                  <p className="mt-1 font-medium text-foreground">{patientData.nurseName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <User className="h-5 w-5 text-primary" />
            <p className="text-sm text-secondary">Primary Doctor</p>
          </div>
          <p className="text-lg font-bold text-foreground">{patientData.doctorName}</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <p className="text-sm text-secondary">Last Update</p>
          </div>
          <p className="text-lg font-bold text-foreground">{getTimeSinceUpdate()}</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-5 w-5 text-primary" />
            <p className="text-sm text-secondary">Account Status</p>
          </div>
          <p className="text-lg font-bold text-success">Active</p>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
        <div className="flex gap-4">
          <Shield className="h-6 w-6 flex-shrink-0 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900">Your Data is Protected</h3>
            <p className="mt-2 text-sm text-blue-700">
              All your personal and medical information is encrypted and stored securely. 
              Only authorized healthcare providers can access your records with your permission.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}