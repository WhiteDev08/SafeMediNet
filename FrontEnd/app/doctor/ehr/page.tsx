"use client"

import { FileText, Lock, Eye, Share2, Download } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DoctorEHRPage() {
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const router = useRouter()

  const records = [
    {
      id: "1",
      patient: "John Doe",
      type: "Lab Results",
      date: "Oct 20, 2025",
      status: "Completed",
      access: "Full",
    },
    {
      id: "2",
      patient: "Jane Smith",
      type: "Prescription",
      date: "Oct 18, 2025",
      status: "Active",
      access: "Limited",
    },
    {
      id: "3",
      patient: "Mike Johnson",
      type: "Appointment Notes",
      date: "Oct 15, 2025",
      status: "Completed",
      access: "Full",
    },
    {
      id: "4",
      patient: "Sarah Williams",
      type: "Imaging Report",
      date: "Oct 12, 2025",
      status: "Pending Review",
      access: "Full",
    },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Electronic Health Records</h1>
        <p className="mt-2 text-secondary">Manage and access patient EHR with privacy controls</p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Records List */}
        <div className="card p-6 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Patient Records</h2>
            <button onClick={() => alert("Add new record form would open here")} className="btn-primary text-sm">
              Add Record
            </button>
          </div>

          <div className="space-y-3">
            {records.map((record) => (
              <div
                key={record.id}
                onClick={() => setSelectedRecord(record.id)}
                className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                  selectedRecord === record.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-surface-alt"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground">{record.patient}</h3>
                    </div>
                    <p className="mt-1 text-sm text-secondary">{record.type}</p>
                    <div className="mt-2 flex gap-2">
                      <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        {record.status}
                      </span>
                      <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        {record.access} Access
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-secondary">{record.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Record Details & Actions */}
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Record Details</h2>

          {selectedRecord ? (
            <div className="space-y-4">
              {records
                .filter((r) => r.id === selectedRecord)
                .map((record) => (
                  <div key={record.id}>
                    <div className="mb-4 rounded-lg bg-surface-alt p-4">
                      <p className="text-xs text-secondary">Patient</p>
                      <p className="font-semibold text-foreground">{record.patient}</p>
                      <p className="mt-2 text-xs text-secondary">Record Type</p>
                      <p className="font-semibold text-foreground">{record.type}</p>
                      <p className="mt-2 text-xs text-secondary">Date</p>
                      <p className="font-semibold text-foreground">{record.date}</p>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => alert(`Viewing full record for ${record.patient}`)}
                        className="flex w-full items-center gap-2 rounded-lg bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition-all duration-200 hover:bg-blue-100"
                      >
                        <Eye className="h-4 w-4" />
                        View Full Record
                      </button>
                      <button
                        onClick={() => alert(`Downloaded ${record.type} for ${record.patient}`)}
                        className="flex w-full items-center gap-2 rounded-lg bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 transition-all duration-200 hover:bg-green-100"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="flex w-full items-center gap-2 rounded-lg bg-purple-50 px-4 py-2.5 text-sm font-medium text-purple-700 transition-all duration-200 hover:bg-purple-100"
                      >
                        <Share2 className="h-4 w-4" />
                        Share Access
                      </button>
                      <button
                        onClick={() => router.push("/patient/access-control")}
                        className="flex w-full items-center gap-2 rounded-lg bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-700 transition-all duration-200 hover:bg-orange-100"
                      >
                        <Lock className="h-4 w-4" />
                        Access Control
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-center">
              <p className="text-secondary">Select a record to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Access Control Info */}
      <div className="mt-8 card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Privacy & Access Control</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-4">
            <Lock className="mb-2 h-6 w-6 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Encryption</h3>
            <p className="mt-1 text-sm text-blue-700">All records encrypted end-to-end</p>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <Eye className="mb-2 h-6 w-6 text-green-600" />
            <h3 className="font-semibold text-green-900">Audit Logs</h3>
            <p className="mt-1 text-sm text-green-700">Track all access and modifications</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-4">
            <Share2 className="mb-2 h-6 w-6 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Granular Control</h3>
            <p className="mt-1 text-sm text-purple-700">Fine-grained access permissions</p>
          </div>
        </div>
      </div>

      {/* Share Access Modal */}
      {showShareModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="card p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground">Share Record Access</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Doctor Email</label>
                <input type="email" placeholder="doctor@example.com" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Access Level</label>
                <select className="input-field">
                  <option>Full Access</option>
                  <option>Limited Access</option>
                  <option>View Only</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowShareModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowShareModal(false)
                    alert("Access shared successfully!")
                  }}
                  className="btn-primary flex-1"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
