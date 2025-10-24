"use client"

import { useState } from "react"
import { Topbar } from "@/components/topbar"
import { Shield } from "lucide-react"

interface Doctor {
  id: number
  name: string
  hasAccess: boolean
  lastAccess: string
}

export default function PatientAccessControl() {
  const [doctors, setDoctors] = useState<Doctor[]>([
    { id: 1, name: "Dr. Michael Smith", hasAccess: true, lastAccess: "2025-01-15 10:30" },
    { id: 2, name: "Dr. Sarah Johnson", hasAccess: true, lastAccess: "2025-01-14 14:15" },
    { id: 3, name: "Dr. Robert Brown", hasAccess: false, lastAccess: "Never" },
  ])

  const [showConfirm, setShowConfirm] = useState<number | null>(null)

  const toggleAccess = (id: number) => {
    setDoctors(doctors.map((d) => (d.id === id ? { ...d, hasAccess: !d.hasAccess } : d)))
    setShowConfirm(null)
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
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Access</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Last Access</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor.id} className="border-b border-border hover:bg-surface-alt">
                    <td className="px-4 py-3 font-medium text-foreground">{doctor.name}</td>
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
                      <button onClick={() => setShowConfirm(doctor.id)} className="text-primary hover:underline">
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
                              <button onClick={() => setShowConfirm(null)} className="btn-secondary flex-1">
                                Cancel
                              </button>
                              <button onClick={() => toggleAccess(doctor.id)} className="btn-primary flex-1">
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
        </div>
      </div>
    </div>
  )
}
