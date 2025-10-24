"use client"

import { FileText, Lock, Calendar, User } from "lucide-react"
import { useState } from "react"

export default function PatientRecordsPage() {
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null)

  const records = [
    {
      id: "1",
      type: "Lab Results",
      date: "Oct 20, 2025",
      doctor: "Dr. Smith",
      status: "Available",
      description: "Blood work and chemistry panel results",
    },
    {
      id: "2",
      type: "Prescription",
      date: "Oct 18, 2025",
      doctor: "Dr. Johnson",
      status: "Active",
      description: "Medication prescription for hypertension",
    },
    {
      id: "3",
      type: "Appointment Notes",
      date: "Oct 15, 2025",
      doctor: "Dr. Williams",
      status: "Available",
      description: "Follow-up appointment notes and recommendations",
    },
    {
      id: "4",
      type: "Imaging Report",
      date: "Oct 12, 2025",
      doctor: "Dr. Brown",
      status: "Available",
      description: "X-ray imaging report and analysis",
    },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Medical Records</h1>
        <p className="mt-2 text-secondary">View and manage your health information</p>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {records.map((record) => (
          <div key={record.id} className="card overflow-hidden transition-all duration-200">
            <button
              onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
              className="w-full px-6 py-4 text-left hover:bg-surface-alt"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-semibold text-foreground">{record.type}</h3>
                      <p className="mt-1 text-sm text-secondary">{record.description}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{record.status}</p>
                  <p className="text-xs text-secondary">{record.date}</p>
                </div>
              </div>
            </button>

            {expandedRecord === record.id && (
              <div className="border-t border-border bg-surface-alt px-6 py-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <User className="h-4 w-4 text-secondary" />
                      <span className="text-sm text-secondary">Physician</span>
                    </div>
                    <p className="font-medium text-foreground">{record.doctor}</p>
                  </div>
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-secondary" />
                      <span className="text-sm text-secondary">Date</span>
                    </div>
                    <p className="font-medium text-foreground">{record.date}</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-all duration-200 hover:bg-blue-100">
                    <FileText className="h-4 w-4" />
                    View Details
                  </button>
                  <button className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition-all duration-200 hover:bg-green-100">
                    <Lock className="h-4 w-4" />
                    Manage Access
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Privacy Notice */}
      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
        <div className="flex gap-4">
          <Lock className="h-6 w-6 flex-shrink-0 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900">Your Privacy is Protected</h3>
            <p className="mt-2 text-sm text-blue-700">
              All your medical records are encrypted and protected. You control who can access your information. View
              your access logs anytime to see who has viewed your records.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
