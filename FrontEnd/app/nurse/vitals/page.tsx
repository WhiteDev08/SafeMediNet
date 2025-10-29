"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Heart, AlertCircle, CheckCircle, TrendingUp, Search } from "lucide-react"
import { nurseUpdateVitals, getPatientVitals, decryptData } from "@/firebase"
import { useAuth } from "@/hooks/use-auth"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/firebase"
import { useSearchParams } from "next/navigation"

interface PatientOption {
  id: string
  name: string
  lastUpdated?: Date
}

interface PreviousVitals {
  heartRate: number
  systolicBP: number
  diastolicBP: number
  temperature: number
  oxygenSaturation: number
  respiratoryRate: number
  bloodGlucose: number
  weight: number
  height: number
}

export default function NurseVitalsPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const preselectedPatientId = searchParams?.get('patientId')

  const [assignedPatients, setAssignedPatients] = useState<PatientOption[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [previousVitals, setPreviousVitals] = useState<PreviousVitals | null>(null)
  const [loadingPrevious, setLoadingPrevious] = useState(false)

  const [formData, setFormData] = useState({
    patientId: preselectedPatientId || "",
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
    deviceType: "Manual Update",
    notes: "",
  })

  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch assigned patients
  useEffect(() => {
    const fetchAssignedPatients = async () => {
      if (!user?.id) return

      setLoadingPatients(true)
      try {
        const patientsQuery = query(
          collection(db, "patients"),
          where("assignedNurse", "==", user.id)
        )

        const snapshot = await getDocs(patientsQuery)
        const patients: PatientOption[] = []

        snapshot.forEach((doc) => {
          const data = doc.data()
          patients.push({
            id: doc.id,
            name: data.name || "Unknown",
            lastUpdated: data.lastUpdated?.toDate()
          })
        })

        // Sort by last updated (most recent first)
        patients.sort((a, b) => {
          if (!a.lastUpdated) return 1
          if (!b.lastUpdated) return -1
          return b.lastUpdated.getTime() - a.lastUpdated.getTime()
        })

        setAssignedPatients(patients)
      } catch (error) {
        console.error("Error fetching assigned patients:", error)
        setErrors({ patients: "Failed to load assigned patients" })
      } finally {
        setLoadingPatients(false)
      }
    }

    fetchAssignedPatients()
  }, [user])

  // Load previous vitals when patient is selected
  useEffect(() => {
    const loadPreviousVitals = async () => {
      if (!formData.patientId) {
        setPreviousVitals(null)
        return
      }

      setLoadingPrevious(true)
      try {
        const vitals = await getPatientVitals(formData.patientId)
        setPreviousVitals(vitals)
      } catch (error) {
        console.error("Error loading previous vitals:", error)
      } finally {
        setLoadingPrevious(false)
      }
    }

    loadPreviousVitals()
  }, [formData.patientId])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.patientId) {
      newErrors.patientId = "Patient ID is required"
    } else {
      // Verify patient is assigned to this nurse
      const isAssigned = assignedPatients.some(p => p.id === formData.patientId)
      if (!isAssigned) {
        newErrors.patientId = "You are not assigned to this patient"
      }
    }

    if (!formData.heartRate) newErrors.heartRate = "Heart rate is required"
    if (!formData.systolicBP) newErrors.systolicBP = "Systolic BP is required"
    if (!formData.diastolicBP) newErrors.diastolicBP = "Diastolic BP is required"
    if (!formData.temperature) newErrors.temperature = "Temperature is required"
    if (!formData.oxygenSaturation) newErrors.oxygenSaturation = "Oxygen saturation is required"

    // Validate ranges
    const hr = Number(formData.heartRate)
    if (formData.heartRate && (hr < 30 || hr > 200)) {
      newErrors.heartRate = "Heart rate should be between 30-200 bpm"
    }

    const temp = Number(formData.temperature)
    if (formData.temperature && (temp < 35 || temp > 42)) {
      newErrors.temperature = "Temperature should be between 35-42°C"
    }

    const o2 = Number(formData.oxygenSaturation)
    if (formData.oxygenSaturation && (o2 < 70 || o2 > 100)) {
      newErrors.oxygenSaturation = "Oxygen saturation should be between 70-100%"
    }

    const systolic = Number(formData.systolicBP)
    const diastolic = Number(formData.diastolicBP)
    if (systolic && diastolic && diastolic >= systolic) {
      newErrors.diastolicBP = "Diastolic BP must be less than systolic BP"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!user) {
      setErrors({ submit: "User not authenticated" })
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare vitals data
      const vitalsData = {
        heartRate: Number(formData.heartRate),
        systolicBP: Number(formData.systolicBP),
        diastolicBP: Number(formData.diastolicBP),
        temperature: Number(formData.temperature),
        oxygenSaturation: Number(formData.oxygenSaturation),
        respiratoryRate: Number(formData.respiratoryRate) || 0,
        bloodGlucose: Number(formData.bloodGlucose) || 0,
        weight: Number(formData.weight) || 0,
        height: Number(formData.height) || 0,
      }

      const result = await nurseUpdateVitals(
        formData.patientId,
        user.id,
        vitalsData
      )

      if (result.success) {
        console.log("✅ Vitals submitted successfully")
        setSubmitted(true)

        // Reset form after 3 seconds
        setTimeout(() => {
          setFormData({
            patientId: "",
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
            deviceType: "Manual Update",
            notes: "",
          })
          setSubmitted(false)
          setPreviousVitals(null)
        }, 3000)
      } else {
        setErrors({ submit: result.error || "Failed to submit vitals" })
      }
    } catch (error) {
      console.error("Error submitting vitals:", error)
      setErrors({ submit: "Failed to submit vitals. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handlePatientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientId = e.target.value
    setFormData(prev => ({ ...prev, patientId }))
    if (errors.patientId) {
      setErrors(prev => ({ ...prev, patientId: "" }))
    }
  }

  const getComparisonClass = (current: string, previous: number | undefined) => {
    if (!current || !previous) return ""
    const currentNum = Number(current)
    const diff = ((currentNum - previous) / previous) * 100
    if (Math.abs(diff) > 10) return "border-yellow-400 border-2"
    return ""
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="card max-w-md p-8 text-center">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h2 className="mb-2 text-2xl font-bold text-foreground">Parameters Submitted Successfully!</h2>
          <p className="text-secondary">
            The vitals have been encrypted, stored, and sent for analysis.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">IoMT Medical Parameters</h1>
        <p className="mt-2 text-secondary">Submit vital signs from IoMT devices</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Patient Selection */}
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
            <Heart className="h-5 w-5 text-primary" />
            Patient Information
          </h2>
          
          {errors.patients && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {errors.patients}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Select Patient *
              </label>
              <select
                name="patientId"
                value={formData.patientId}
                onChange={handlePatientSelect}
                className={`input-field ${errors.patientId ? "border-error" : ""}`}
                disabled={isSubmitting || loadingPatients}
              >
                <option value="">-- Select a patient --</option>
                {assignedPatients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} ({patient.id})
                  </option>
                ))}
              </select>
              {errors.patientId && <p className="mt-1 text-xs text-error">{errors.patientId}</p>}
              {loadingPatients && <p className="mt-1 text-xs text-secondary">Loading patients...</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Device Type</label>
              <select 
                name="deviceType" 
                value={formData.deviceType} 
                onChange={handleChange} 
                className="input-field"
                disabled={isSubmitting}
              >
                <option value="Manual Update">Manual Update</option>
                <option value="Pulse Oximeter">Pulse Oximeter</option>
                <option value="Blood Pressure Monitor">Blood Pressure Monitor</option>
                <option value="Thermometer">Thermometer</option>
                <option value="Glucose Meter">Glucose Meter</option>
                <option value="Multi-Parameter Monitor">Multi-Parameter Monitor</option>
              </select>
            </div>
          </div>

          {/* Previous Vitals Display */}
          {formData.patientId && (
            <div className="mt-4 rounded-lg bg-blue-50 p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Previous Vitals
              </h3>
              {loadingPrevious ? (
                <p className="text-sm text-blue-700">Loading previous vitals...</p>
              ) : previousVitals ? (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-blue-700">HR:</span>
                    <span className="ml-1 font-semibold text-blue-900">{previousVitals.heartRate} bpm</span>
                  </div>
                  <div>
                    <span className="text-blue-700">BP:</span>
                    <span className="ml-1 font-semibold text-blue-900">
                      {previousVitals.systolicBP}/{previousVitals.diastolicBP}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Temp:</span>
                    <span className="ml-1 font-semibold text-blue-900">{previousVitals.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-blue-700">SpO2:</span>
                    <span className="ml-1 font-semibold text-blue-900">{previousVitals.oxygenSaturation}%</span>
                  </div>
                  {previousVitals.respiratoryRate > 0 && (
                    <div>
                      <span className="text-blue-700">RR:</span>
                      <span className="ml-1 font-semibold text-blue-900">{previousVitals.respiratoryRate}/min</span>
                    </div>
                  )}
                  {previousVitals.bloodGlucose > 0 && (
                    <div>
                      <span className="text-blue-700">Glucose:</span>
                      <span className="ml-1 font-semibold text-blue-900">{previousVitals.bloodGlucose} mg/dL</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-blue-700">No previous vitals recorded</p>
              )}
            </div>
          )}
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
                className={`input-field ${errors.heartRate ? "border-error" : ""} ${getComparisonClass(formData.heartRate, previousVitals?.heartRate)}`}
                disabled={isSubmitting}
              />
              {errors.heartRate && <p className="mt-1 text-xs text-error">{errors.heartRate}</p>}
              {previousVitals && formData.heartRate && (
                <p className="mt-1 text-xs text-secondary">
                  Previous: {previousVitals.heartRate} bpm
                </p>
              )}
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Systolic BP (mmHg) *</label>
              <input
                type="number"
                name="systolicBP"
                value={formData.systolicBP}
                onChange={handleChange}
                placeholder="120"
                className={`input-field ${errors.systolicBP ? "border-error" : ""} ${getComparisonClass(formData.systolicBP, previousVitals?.systolicBP)}`}
                disabled={isSubmitting}
              />
              {errors.systolicBP && <p className="mt-1 text-xs text-error">{errors.systolicBP}</p>}
              {previousVitals && formData.systolicBP && (
                <p className="mt-1 text-xs text-secondary">
                  Previous: {previousVitals.systolicBP} mmHg
                </p>
              )}
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Diastolic BP (mmHg) *</label>
              <input
                type="number"
                name="diastolicBP"
                value={formData.diastolicBP}
                onChange={handleChange}
                placeholder="80"
                className={`input-field ${errors.diastolicBP ? "border-error" : ""} ${getComparisonClass(formData.diastolicBP, previousVitals?.diastolicBP)}`}
                disabled={isSubmitting}
              />
              {errors.diastolicBP && <p className="mt-1 text-xs text-error">{errors.diastolicBP}</p>}
              {previousVitals && formData.diastolicBP && (
                <p className="mt-1 text-xs text-secondary">
                  Previous: {previousVitals.diastolicBP} mmHg
                </p>
              )}
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
                className={`input-field ${errors.temperature ? "border-error" : ""} ${getComparisonClass(formData.temperature, previousVitals?.temperature)}`}
                disabled={isSubmitting}
              />
              {errors.temperature && <p className="mt-1 text-xs text-error">{errors.temperature}</p>}
              {previousVitals && formData.temperature && (
                <p className="mt-1 text-xs text-secondary">
                  Previous: {previousVitals.temperature}°C
                </p>
              )}
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Respiratory Rate (breaths/min)</label>
              <input
                type="number"
                name="respiratoryRate"
                value={formData.respiratoryRate}
                onChange={handleChange}
                placeholder="12-20"
                className={`input-field ${getComparisonClass(formData.respiratoryRate, previousVitals?.respiratoryRate)}`}
                disabled={isSubmitting}
              />
              {previousVitals && previousVitals.respiratoryRate > 0 && formData.respiratoryRate && (
                <p className="mt-1 text-xs text-secondary">
                  Previous: {previousVitals.respiratoryRate}/min
                </p>
              )}
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
                className={`input-field ${errors.oxygenSaturation ? "border-error" : ""} ${getComparisonClass(formData.oxygenSaturation, previousVitals?.oxygenSaturation)}`}
                disabled={isSubmitting}
              />
              {errors.oxygenSaturation && <p className="mt-1 text-xs text-error">{errors.oxygenSaturation}</p>}
              {previousVitals && formData.oxygenSaturation && (
                <p className="mt-1 text-xs text-secondary">
                  Previous: {previousVitals.oxygenSaturation}%
                </p>
              )}
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
                className={`input-field ${getComparisonClass(formData.bloodGlucose, previousVitals?.bloodGlucose)}`}
                disabled={isSubmitting}
              />
              {previousVitals && previousVitals.bloodGlucose > 0 && formData.bloodGlucose && (
                <p className="mt-1 text-xs text-secondary">
                  Previous: {previousVitals.bloodGlucose} mg/dL
                </p>
              )}
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
                className={`input-field ${getComparisonClass(formData.weight, previousVitals?.weight)}`}
                disabled={isSubmitting}
              />
              {previousVitals && previousVitals.weight > 0 && formData.weight && (
                <p className="mt-1 text-xs text-secondary">
                  Previous: {previousVitals.weight} kg
                </p>
              )}
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="170"
                className={`input-field ${getComparisonClass(formData.height, previousVitals?.height)}`}
                disabled={isSubmitting}
              />
              {previousVitals && previousVitals.height > 0 && formData.height && (
                <p className="mt-1 text-xs text-secondary">
                  Previous: {previousVitals.height} cm
                </p>
              )}
            </div>
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
            disabled={isSubmitting}
          />
          <p className="mt-2 text-xs text-secondary">
            Note: Additional notes are for reference only and are not stored in the database.
          </p>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="rounded-lg bg-error/10 p-4 text-sm text-error border border-error">
            <strong>Error:</strong> {errors.submit}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting || !formData.patientId}
            className="flex-1 rounded-lg bg-gradient-primary px-6 py-3 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting Parameters..." : "Submit Parameters"}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            className="flex-1 rounded-lg border-2 border-border px-6 py-3 font-semibold text-foreground transition-all hover:bg-surface-alt disabled:opacity-50"
            onClick={() => {
              setFormData({
                patientId: "",
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
                deviceType: "Manual Update",
                notes: "",
              })
              setErrors({})
              setPreviousVitals(null)
            }}
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  )
}