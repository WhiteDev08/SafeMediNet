"use client"

import type React from "react"
import { useState } from "react"
import { Heart, Lock, UserPlus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import type { UserRole } from "@/lib/auth"

export default function LoginPage() {
  const { login, signup, isLoading: authLoading } = useAuth()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [role, setRole] = useState<UserRole>("doctor")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Login form state
  const [loginUserId, setLoginUserId] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Signup form state
  const [signupData, setSignupData] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    department: "",
    licenseNumber: "", // for nurses
    dob: "", // for patients
    bloodType: "", // for patients
    assignedDoctor: "", // for patients
    assignedNurse: "" // for patients
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const success = await login(loginUserId, loginPassword, role)
      
      if (!success) {
        setError("Invalid credentials. Please check your User ID and password.")
        setIsLoading(false)
      }
    } catch (err) {
      setError("Login failed. Please try again.")
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate passwords match
    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Validate password strength
    if (signupData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      const result = await signup(signupData, role)
      
      if (result.success) {
        setSuccess(`${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully! Redirecting...`)
        // Clear form
        setSignupData({
          id: "", name: "", email: "", password: "", confirmPassword: "",
          phone: "", department: "", licenseNumber: "", dob: "", bloodType: "",
          assignedDoctor: "", assignedNurse: ""
        })
        // Switch to login after 2 seconds
        setTimeout(() => {
          setMode("login")
          setSuccess("")
        }, 2000)
      } else {
        setError(result.error || "Signup failed. Please try again.")
      }
      setIsLoading(false)
    } catch (err) {
      setError("Signup failed. Please try again.")
      setIsLoading(false)
    }
  }

  const placeholders = {
    doctor: "e.g., DOC001",
    patient: "e.g., PAT001",
    nurse: "e.g., NURSE001"
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex items-center justify-center rounded-full bg-gradient-primary p-4">
            <div className="flex items-center gap-2">
              <Lock className="h-6 w-6 text-white" />
              <Heart className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gradient-primary">SafeMediNet</h1>
          <p className="mt-2 text-center text-sm text-secondary">Privacy-Preserving EHR Network</p>
        </div>

        {/* Login/Signup Card */}
        <div className="card p-8">
          {/* Mode Toggle */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => {
                setMode("login")
                setError("")
                setSuccess("")
              }}
              disabled={isLoading || authLoading}
              className={`flex-1 rounded-lg py-2 font-semibold transition-all duration-300 ${
                mode === "login" ? "bg-gradient-primary text-white" : "bg-surface-alt text-foreground hover:bg-border"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setMode("signup")
                setError("")
                setSuccess("")
              }}
              disabled={isLoading || authLoading}
              className={`flex-1 rounded-lg py-2 font-semibold transition-all duration-300 ${
                mode === "signup" ? "bg-gradient-primary text-white" : "bg-surface-alt text-foreground hover:bg-border"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Role Tabs */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setRole("doctor")}
              disabled={isLoading || authLoading}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all duration-300 ${
                role === "doctor" ? "bg-gradient-primary text-white" : "bg-surface-alt text-foreground hover:bg-border"
              }`}
            >
              Doctor
            </button>
            <button
              onClick={() => setRole("patient")}
              disabled={isLoading || authLoading}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all duration-300 ${
                role === "patient" ? "bg-gradient-primary text-white" : "bg-surface-alt text-foreground hover:bg-border"
              }`}
            >
              Patient
            </button>
            <button
              onClick={() => setRole("nurse")}
              disabled={isLoading || authLoading}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all duration-300 ${
                role === "nurse" ? "bg-gradient-primary text-white" : "bg-surface-alt text-foreground hover:bg-border"
              }`}
            >
              Nurse
            </button>
          </div>

          {/* Login Form */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">User ID</label>
                <input
                  type="text"
                  value={loginUserId}
                  onChange={(e) => setLoginUserId(e.target.value)}
                  placeholder={placeholders[role]}
                  className="input-field"
                  disabled={isLoading || authLoading}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  className="input-field"
                  disabled={isLoading || authLoading}
                  required
                />
              </div>

              {error && <div className="rounded-lg bg-error/10 p-3 text-sm text-error">{error}</div>}

              <button 
                type="submit" 
                className="btn-primary w-full" 
                disabled={isLoading || authLoading}
              >
                {isLoading || authLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}

          {/* Signup Form */}
          {mode === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">User ID *</label>
                <input
                  type="text"
                  value={signupData.id}
                  onChange={(e) => setSignupData({...signupData, id: e.target.value})}
                  placeholder={placeholders[role]}
                  className="input-field"
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Full Name *</label>
                <input
                  type="text"
                  value={signupData.name}
                  onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                  placeholder="Enter full name"
                  className="input-field"
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Email *</label>
                <input
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                  placeholder="email@example.com"
                  className="input-field"
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Phone *</label>
                <input
                  type="tel"
                  value={signupData.phone}
                  onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
                  placeholder="+1234567890"
                  className="input-field"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Doctor/Nurse specific fields */}
              {(role === "doctor" || role === "nurse") && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">Department *</label>
                  <input
                    type="text"
                    value={signupData.department}
                    onChange={(e) => setSignupData({...signupData, department: e.target.value})}
                    placeholder="e.g., Cardiology, ICU"
                    className="input-field"
                    disabled={isLoading}
                    required
                  />
                </div>
              )}

              {/* Nurse specific field */}
              {role === "nurse" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">License Number *</label>
                  <input
                    type="text"
                    value={signupData.licenseNumber}
                    onChange={(e) => setSignupData({...signupData, licenseNumber: e.target.value})}
                    placeholder="e.g., RN123456"
                    className="input-field"
                    disabled={isLoading}
                    required
                  />
                </div>
              )}

              {/* Patient specific fields */}
              {role === "patient" && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Date of Birth *</label>
                    <input
                      type="date"
                      value={signupData.dob}
                      onChange={(e) => setSignupData({...signupData, dob: e.target.value})}
                      className="input-field"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Blood Type *</label>
                    <select
                      value={signupData.bloodType}
                      onChange={(e) => setSignupData({...signupData, bloodType: e.target.value})}
                      className="input-field"
                      disabled={isLoading}
                      required
                    >
                      <option value="">Select blood type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Assigned Doctor ID</label>
                    <input
                      type="text"
                      value={signupData.assignedDoctor}
                      onChange={(e) => setSignupData({...signupData, assignedDoctor: e.target.value})}
                      placeholder="e.g., DOC001 (optional)"
                      className="input-field"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Assigned Nurse ID</label>
                    <input
                      type="text"
                      value={signupData.assignedNurse}
                      onChange={(e) => setSignupData({...signupData, assignedNurse: e.target.value})}
                      placeholder="e.g., NURSE001 (optional)"
                      className="input-field"
                      disabled={isLoading}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Password *</label>
                <input
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                  placeholder="Min 6 characters"
                  className="input-field"
                  disabled={isLoading}
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Confirm Password *</label>
                <input
                  type="password"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                  placeholder="Re-enter password"
                  className="input-field"
                  disabled={isLoading}
                  required
                />
              </div>

              {error && <div className="rounded-lg bg-error/10 p-3 text-sm text-error">{error}</div>}
              {success && <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600">{success}</div>}

              <button 
                type="submit" 
                className="btn-primary w-full flex items-center justify-center gap-2" 
                disabled={isLoading}
              >
                <UserPlus className="h-4 w-4" />
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-secondary">© SafeMediNet 2025 – Privacy Preserving EHR Platform</p>
      </div>
    </div>
  )
}