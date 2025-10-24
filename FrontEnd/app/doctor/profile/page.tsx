"use client"

import { User, Mail, Phone, Award } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function DoctorProfilePage() {
  const { user } = useAuth()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="mt-2 text-secondary">View your professional information</p>
      </div>

      {/* Profile Card */}
      <div className="card p-8">
        <div className="flex flex-col items-center md:flex-row md:items-start md:gap-8">
          {/* Avatar */}
          <div className="mb-6 flex flex-col items-center md:mb-0">
            <div className="mb-4 h-24 w-24 rounded-full bg-gradient-primary flex items-center justify-center">
              <User className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Dr. John Smith</h2>
            <p className="text-secondary">Cardiology Specialist</p>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-secondary">Email</p>
                  <p className="font-medium text-foreground">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-secondary">Phone</p>
                  <p className="font-medium text-foreground">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-secondary">License</p>
                  <p className="font-medium text-foreground">MD-12345</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-secondary">Specialization</p>
                  <p className="font-medium text-foreground">Cardiology</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="mb-3 font-semibold text-foreground">Professional Summary</h3>
              <p className="text-secondary">
                Experienced cardiologist with 15+ years of practice. Specializing in preventive cardiology and patient
                education. Committed to providing comprehensive healthcare using the latest technology.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="card p-6">
          <p className="text-sm text-secondary">Total Patients</p>
          <p className="mt-2 text-3xl font-bold text-foreground">24</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-secondary">Active Cases</p>
          <p className="mt-2 text-3xl font-bold text-foreground">8</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-secondary">Years Experience</p>
          <p className="mt-2 text-3xl font-bold text-foreground">15</p>
        </div>
      </div>
    </div>
  )
}
