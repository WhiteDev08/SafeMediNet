"use client"

import type React from "react"

import { useState } from "react"
import { Bell, Lock, User } from "lucide-react"

export default function NurseSettings() {
  const [settings, setSettings] = useState({
    fullName: "Sarah Johnson",
    email: "nurse@safemedi.net",
    phone: "+1 (555) 123-4567",
    department: "Cardiology",
    licenseNumber: "RN-2024-001",
    notifications: true,
    emailAlerts: true,
    twoFactor: false,
  })

  const [saved, setSaved] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSave = () => {
    console.log("[v0] Settings saved:", settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="mt-2 text-secondary">Manage your profile and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
          <User className="h-5 w-5 text-primary" />
          Profile Information
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={settings.fullName}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">Email</label>
            <input type="email" name="email" value={settings.email} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">Phone</label>
            <input type="tel" name="phone" value={settings.phone} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">Department</label>
            <input
              type="text"
              name="department"
              value={settings.department}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-foreground">License Number</label>
            <input
              type="text"
              name="licenseNumber"
              value={settings.licenseNumber}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
          <Bell className="h-5 w-5 text-primary" />
          Notifications
        </h2>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="notifications"
              checked={settings.notifications}
              onChange={handleChange}
              className="h-4 w-4 rounded border-border"
            />
            <span className="text-foreground">Enable push notifications</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="emailAlerts"
              checked={settings.emailAlerts}
              onChange={handleChange}
              className="h-4 w-4 rounded border-border"
            />
            <span className="text-foreground">Receive email alerts for critical parameters</span>
          </label>
        </div>
      </div>

      {/* Security Section */}
      <div className="card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
          <Lock className="h-5 w-5 text-primary" />
          Security
        </h2>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="twoFactor"
              checked={settings.twoFactor}
              onChange={handleChange}
              className="h-4 w-4 rounded border-border"
            />
            <span className="text-foreground">Enable two-factor authentication</span>
          </label>
          <button className="rounded-lg border-2 border-border px-4 py-2 font-semibold text-foreground transition-all hover:bg-surface-alt">
            Change Password
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          className="flex-1 rounded-lg bg-gradient-primary px-6 py-3 font-semibold text-white transition-all hover:shadow-lg"
        >
          Save Changes
        </button>
      </div>

      {/* Success Message */}
      {saved && <div className="rounded-lg bg-green-100 p-4 text-green-700">✓ Settings saved successfully!</div>}
    </div>
  )
}
