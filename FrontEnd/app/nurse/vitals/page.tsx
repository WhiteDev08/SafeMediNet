"use client"

import type React from "react"

import { useState } from "react"
import { Heart, AlertCircle, CheckCircle } from "lucide-react"

export default function NurseVitalsPage() {
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    deviceId: "",
    timestamp: new Date().toISOString().slice(0, 16),
    // Vital Signs
    heartRate: "",
    systolicBP: "",
    diastolicBP: "",
    temperature: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    // Additional Parameters
    bloodGlucose: "",
    weight: "",
    height: "",
    // Device Info
    deviceType: "pulse-oximeter",
    notes: "",
  })

  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.patientId) newErrors.patientId = "Patient ID is required"
    if (!formData.patientName) newErrors.patientName = "Patient name is required"
    if (!formData.heartRate) newErrors.heartRate = "Heart rate is required"
    if (!formData.systolicBP) newErrors.systolicBP = "Systolic BP is required"
    if (!formData.diastolicBP) newErrors.diastolicBP = "Diastolic BP is required"
    if (!formData.temperature) newErrors.temperature = "Temperature is required"
    if (!formData.oxygenSaturation) newErrors.oxygenSaturation = "Oxygen saturation is required"

    // Validate ranges
    if (formData.heartRate && (Number(formData.heartRate) < 30 || Number(formData.heartRate) > 200)) {
      newErrors.heartRate = "Heart rate should be between 30-200 bpm"
    }
    if (formData.temperature && (Number(formData.temperature) < 35 || Number(formData.temperature) > 42)) {
      newErrors.temperature = "Temperature should be between 35-42°C"
    }
    if (
      formData.oxygenSaturation &&
      (Number(formData.oxygenSaturation) < 70 || Number(formData.oxygenSaturation) > 100)
    ) {
      newErrors.oxygenSaturation = "Oxygen saturation should be between 70-100%"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Simulate form submission
    console.log("[v0] Form submitted:", formData)
    setSubmitted(true)

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        patientId: "",
        patientName: "",
        deviceId: "",
        timestamp: new Date().toISOString().slice(0, 16),
        heartRate: "",
        systolicBP: "",
        diastolicBP: "",
        temperature: "",
        respiratoryRate: "",
        oxygenSaturation: "",
        bloodGlucose: "",
        weight: "",
        height: "",
        deviceType: "pulse-oximeter",
        notes: "",
      })
      setSubmitted(false)
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="card max-w-md p-8 text-center">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h2 className="mb-2 text-2xl font-bold text-foreground">Parameters Submitted Successfully!</h2>
          <p className="text-secondary">
            The medical parameters have been recorded and will be reflected in the doctor portal.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">IoMT Medical Parameters</h1>
        <p className="mt-2 text-secondary">Submit vital signs and medical data from IoMT devices</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Patient Information Section */}
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
            <Heart className="h-5 w-5 text-primary" />
            Patient Information
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Patient ID *</label>
              <input
                type="text"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                placeholder="e.g., P-12345"
                className={`input-field ${errors.patientId ? "border-error" : ""}`}
              />
              {errors.patientId && <p className="mt-1 text-xs text-error">{errors.patientId}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Patient Name *</label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                placeholder="Full name"
                className={`input-field ${errors.patientName ? "border-error" : ""}`}
              />
              {errors.patientName && <p className="mt-1 text-xs text-error">{errors.patientName}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Device ID</label>
              <input
                type="text"
                name="deviceId"
                value={formData.deviceId}
                onChange={handleChange}
                placeholder="e.g., DEV-001"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Timestamp</label>
              <input
                type="datetime-local"
                name="timestamp"
                value={formData.timestamp}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Vital Signs Section */}
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
            <AlertCircle className="h-5 w-5 text-primary" />
            Vital Signs
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Heart Rate (bpm) *</label>
              <input
                type="number"
                name="heartRate"
                value={formData.heartRate}
                onChange={handleChange}
                placeholder="60-100"
                min="30"
                max="200"
                className={`input-field ${errors.heartRate ? "border-error" : ""}`}
              />
              {errors.heartRate && <p className="mt-1 text-xs text-error">{errors.heartRate}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Systolic BP (mmHg) *</label>
              <input
                type="number"
                name="systolicBP"
                value={formData.systolicBP}
                onChange={handleChange}
                placeholder="120"
                className={`input-field ${errors.systolicBP ? "border-error" : ""}`}
              />
              {errors.systolicBP && <p className="mt-1 text-xs text-error">{errors.systolicBP}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Diastolic BP (mmHg) *</label>
              <input
                type="number"
                name="diastolicBP"
                value={formData.diastolicBP}
                onChange={handleChange}
                placeholder="80"
                className={`input-field ${errors.diastolicBP ? "border-error" : ""}`}
              />
              {errors.diastolicBP && <p className="mt-1 text-xs text-error">{errors.diastolicBP}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Temperature (°C) *</label>
              <input
                type="number"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                placeholder="37.0"
                step="0.1"
                min="35"
                max="42"
                className={`input-field ${errors.temperature ? "border-error" : ""}`}
              />
              {errors.temperature && <p className="mt-1 text-xs text-error">{errors.temperature}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Respiratory Rate (breaths/min)</label>
              <input
                type="number"
                name="respiratoryRate"
                value={formData.respiratoryRate}
                onChange={handleChange}
                placeholder="12-20"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Oxygen Saturation (%) *</label>
              <input
                type="number"
                name="oxygenSaturation"
                value={formData.oxygenSaturation}
                onChange={handleChange}
                placeholder="95-100"
                min="70"
                max="100"
                className={`input-field ${errors.oxygenSaturation ? "border-error" : ""}`}
              />
              {errors.oxygenSaturation && <p className="mt-1 text-xs text-error">{errors.oxygenSaturation}</p>}
            </div>
          </div>
        </div>

        {/* Additional Parameters Section */}
        <div className="card p-6">
          <h2 className="mb-4 text-xl font-bold text-foreground">Additional Parameters</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Blood Glucose (mg/dL)</label>
              <input
                type="number"
                name="bloodGlucose"
                value={formData.bloodGlucose}
                onChange={handleChange}
                placeholder="70-100"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="70"
                step="0.1"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="170"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Device Information Section */}
        <div className="card p-6">
          <h2 className="mb-4 text-xl font-bold text-foreground">Device Information</h2>
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">Device Type</label>
            <select name="deviceType" value={formData.deviceType} onChange={handleChange} className="input-field">
              <option value="pulse-oximeter">Pulse Oximeter</option>
              <option value="blood-pressure-monitor">Blood Pressure Monitor</option>
              <option value="thermometer">Thermometer</option>
              <option value="glucose-meter">Glucose Meter</option>
              <option value="multi-parameter">Multi-Parameter Monitor</option>
            </select>
          </div>
        </div>

        {/* Notes Section */}
        <div className="card p-6">
          <h2 className="mb-4 text-xl font-bold text-foreground">Additional Notes</h2>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any additional observations or notes..."
            rows={4}
            className="input-field"
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-gradient-primary px-6 py-3 font-semibold text-white transition-all hover:shadow-lg"
          >
            Submit Parameters
          </button>
          <button
            type="reset"
            className="flex-1 rounded-lg border-2 border-border px-6 py-3 font-semibold text-foreground transition-all hover:bg-surface-alt"
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  )
}
