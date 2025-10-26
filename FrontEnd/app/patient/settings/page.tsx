"use client"

import type React from "react"

import { User, Lock, Bell, Shield } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"

export default function PatientSettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [formData, setFormData] = useState({
    fullName: "John Doe",
    email: user?.email || "",
    phone: "+1 (555) 987-6543",
    dateOfBirth: "1990-05-15",
    bloodType: "O+",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="mt-2 text-secondary">Manage your account and health preferences</p>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex gap-2 border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-secondary hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="card p-8">
          <h2 className="mb-6 text-xl font-semibold text-foreground">Profile Information</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Email</label>
                <input type="email" value={formData.email} disabled className="input-field opacity-50" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Blood Type</label>
              <select name="bloodType" value={formData.bloodType} onChange={handleInputChange} className="input-field">
                <option>O+</option>
                <option>O-</option>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>AB+</option>
                <option>AB-</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button className="btn-primary">Save Changes</button>
              <button className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="card p-8">
          <h2 className="mb-6 text-xl font-semibold text-foreground">Security Settings</h2>
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 font-semibold text-foreground">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">Current Password</label>
                  <input type="password" placeholder="Enter current password" className="input-field" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">New Password</label>
                  <input type="password" placeholder="Enter new password" className="input-field" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">Confirm Password</label>
                  <input type="password" placeholder="Confirm new password" className="input-field" />
                </div>
              </div>
            </div>
            <div className="border-t border-border pt-6">
              <h3 className="mb-4 font-semibold text-foreground">Two-Factor Authentication</h3>
              <p className="mb-4 text-sm text-secondary">Add an extra layer of security to your account</p>
              <button className="btn-primary">Enable 2FA</button>
            </div>
            <div className="flex gap-3 pt-4">
              <button className="btn-primary">Update Security</button>
              <button className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="card p-8">
          <h2 className="mb-6 text-xl font-semibold text-foreground">Notification Preferences</h2>
          <div className="space-y-4">
            {[
              { label: "Health Alerts", description: "Get notified about health changes" },
              { label: "Appointment Reminders", description: "Receive appointment reminders" },
              { label: "Medication Reminders", description: "Get medication reminders" },
              { label: "System Updates", description: "Receive system maintenance notifications" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-secondary">{item.description}</p>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5 rounded" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === "privacy" && (
        <div className="card p-8">
          <h2 className="mb-6 text-xl font-semibold text-foreground">Privacy & Data</h2>
          <div className="space-y-6">
            <div className="rounded-lg bg-blue-50 p-4">
              <h3 className="font-semibold text-blue-900">Your Health Data is Protected</h3>
              <p className="mt-2 text-sm text-blue-700">
                Your medical information is encrypted and only accessible to authorized healthcare providers. You have
                full control over who can access your records.
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-foreground">Authorized Providers</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-foreground">Dr. Smith</p>
                    <p className="text-sm text-secondary">Cardiology - Full Access</p>
                  </div>
                  <button className="text-sm text-red-600 hover:text-red-700">Revoke</button>
                </div>
              </div>
            </div>
            <div className="border-t border-border pt-6">
              <h3 className="mb-4 font-semibold text-foreground">Data Export</h3>
              <p className="mb-4 text-sm text-secondary">Download a copy of your health data</p>
              <button className="btn-secondary">Export Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
