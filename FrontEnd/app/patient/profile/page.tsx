"use client"

import { User, Mail, Phone, Heart } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function PatientProfilePage() {
  const { user } = useAuth()

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
            <h2 className="text-2xl font-bold text-foreground">John Doe</h2>
            <p className="text-secondary">Patient ID: P-12345</p>
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
                  <p className="font-medium text-foreground">+1 (555) 987-6543</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-secondary">Blood Type</p>
                  <p className="font-medium text-foreground">O+</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-secondary">Date of Birth</p>
                  <p className="font-medium text-foreground">May 15, 1990</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="mb-3 font-semibold text-foreground">Health Summary</h3>
              <p className="text-secondary">
                Overall health status is good. Regular checkups recommended. Current medications are being monitored.
                Please contact your healthcare provider for any concerns.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="card p-6">
          <p className="text-sm text-secondary">Primary Doctor</p>
          <p className="mt-2 text-lg font-bold text-foreground">Dr. Smith</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-secondary">Last Checkup</p>
          <p className="mt-2 text-lg font-bold text-foreground">5 days ago</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-secondary">Next Appointment</p>
          <p className="mt-2 text-lg font-bold text-foreground">Nov 15, 2025</p>
        </div>
      </div>
    </div>
  )
}
