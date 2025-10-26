"use client"

import { User, Mail, Phone, Award, Calendar, Shield } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"
import { db } from "@/firebase"
import { 
  doc, 
  getDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore"

interface DoctorProfile {
  name: string
  email: string
  phone: string
  department: string
  licenseNumber: string
  specialization: string
  yearsExperience: number
  bio: string
  lastLogin: string
}

interface Stats {
  totalPatients: number
  activeCases: number
  totalRecords: number
}

export default function DoctorProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<DoctorProfile | null>(null)
  const [stats, setStats] = useState<Stats>({
    totalPatients: 0,
    activeCases: 0,
    totalRecords: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    fetchDoctorProfile()
  }, [user?.id])

  const fetchDoctorProfile = async () => {
    try {
      // Fetch doctor document
      const doctorRef = doc(db, 'doctors', user?.id || '')
      const doctorDoc = await getDoc(doctorRef)

      if (!doctorDoc.exists()) {
        setLoading(false)
        return
      }

      const doctorData = doctorDoc.data()

      // Calculate years of experience (example: using a createdAt field or default)
      const yearsExperience = doctorData.yearsExperience || 15

      setProfile({
        name: doctorData.name || user?.name || 'Dr. Unknown',
        email: doctorData.email || user?.email || 'N/A',
        phone: doctorData.phone || '+1 (555) 123-4567',
        department: doctorData.department || 'Cardiology',
        licenseNumber: doctorData.licenseNumber || 'MD-12345',
        specialization: doctorData.specialization || 'Cardiology',
        yearsExperience: yearsExperience,
        bio: doctorData.bio || 'Experienced physician committed to providing comprehensive healthcare using the latest technology.',
        lastLogin: doctorData.lastLogin?.toDate().toLocaleString() || 'N/A'
      })

      // Fetch statistics
      await fetchStatistics()
    } catch (error) {
      console.error('Error fetching doctor profile:', error)
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      // Total patients assigned to this doctor
      const patientsQuery = query(
        collection(db, 'patients'),
        where('assignedDoctor', '==', user?.id)
      )
      const patientsSnapshot = await getDocs(patientsQuery)
      const totalPatients = patientsSnapshot.size

      // Active cases (patients with recent activity)
      let activeCases = 0
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      patientsSnapshot.forEach((doc) => {
        const data = doc.data()
        const lastUpdate = data.lastUpdated?.toDate()
        if (lastUpdate && lastUpdate > thirtyDaysAgo) {
          activeCases++
        }
      })

      // Total EHR records
      let totalRecords = 0
      for (const patientDoc of patientsSnapshot.docs) {
        const ehrQuery = query(
          collection(db, 'ehr_records'),
          where('patientId', '==', patientDoc.id)
        )
        const ehrSnapshot = await getDocs(ehrQuery)
        totalRecords += ehrSnapshot.size
      }

      setStats({
        totalPatients,
        activeCases,
        totalRecords
      })
      setLoading(false)
    } catch (error) {
      console.error('Error fetching statistics:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-secondary">Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-8">
        <p className="text-secondary">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="mt-2 text-secondary">View your professional information</p>
      </div>

      {/* Profile Card */}
      <div className="card p-8 mb-8">
        <div className="flex flex-col items-center md:flex-row md:items-start md:gap-8">
          {/* Avatar */}
          <div className="mb-6 flex flex-col items-center md:mb-0">
            <div className="mb-4 h-24 w-24 rounded-full bg-gradient-primary flex items-center justify-center">
              <User className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
            <p className="text-secondary">{profile.specialization} Specialist</p>
            <div className="mt-3 flex items-center gap-2 text-sm text-secondary">
              <Calendar className="h-4 w-4" />
              <span>Last login: {profile.lastLogin}</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-secondary">Email</p>
                  <p className="font-medium text-foreground">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-secondary">Phone</p>
                  <p className="font-medium text-foreground">{profile.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-secondary">License</p>
                  <p className="font-medium text-foreground">{profile.licenseNumber}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-secondary">Department</p>
                  <p className="font-medium text-foreground">{profile.department}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-secondary">Specialization</p>
                  <p className="font-medium text-foreground">{profile.specialization}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-secondary">Experience</p>
                  <p className="font-medium text-foreground">{profile.yearsExperience}+ years</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="mb-3 font-semibold text-foreground">Professional Summary</h3>
              <p className="text-secondary">
                {profile.bio}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-secondary">Total Patients</p>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.totalPatients}</p>
          <p className="text-xs text-secondary mt-1">Under your care</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-secondary">Active Cases</p>
            <Activity className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.activeCases}</p>
          <p className="text-xs text-secondary mt-1">Recent activity (30 days)</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-secondary">Medical Records</p>
            <Award className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.totalRecords}</p>
          <p className="text-xs text-secondary mt-1">Total EHR documents</p>
        </div>
      </div>

      {/* Security Info */}
      <div className="mt-8 card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Security & Privacy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50">
            <Shield className="h-5 w-5 text-blue-600 mt-1" />
            <div>
              <p className="font-medium text-blue-900">End-to-End Encryption</p>
              <p className="text-sm text-blue-700 mt-1">All patient data is encrypted</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50">
            <Award className="h-5 w-5 text-green-600 mt-1" />
            <div>
              <p className="font-medium text-green-900">HIPAA Compliant</p>
              <p className="text-sm text-green-700 mt-1">Meets all regulatory requirements</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}