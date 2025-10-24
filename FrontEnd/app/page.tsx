"use client"

import type React from "react"

import { useState } from "react"
import { Heart, Lock } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function LoginPage() {
  const { login } = useAuth()
  const [role, setRole] = useState<"doctor" | "patient" | "nurse">("doctor")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (login(email, password)) {
      // Success - navigation handled by useAuth
    } else {
      setError(
        "Invalid credentials. Try doctor@safemedi.net / 1234, patient@safemedi.net / 1234, or nurse@safemedi.net / 1234",
      )
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
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

        {/* Login Card */}
        <div className="card p-8">
          {/* Role Tabs */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setRole("doctor")}
              disabled={isLoading}
              className={`flex-1 rounded-lg py-2 font-semibold transition-all duration-300 ${
                role === "doctor" ? "bg-gradient-primary text-white" : "bg-surface-alt text-foreground hover:bg-border"
              }`}
            >
              Doctor
            </button>
            <button
              onClick={() => setRole("patient")}
              disabled={isLoading}
              className={`flex-1 rounded-lg py-2 font-semibold transition-all duration-300 ${
                role === "patient" ? "bg-gradient-primary text-white" : "bg-surface-alt text-foreground hover:bg-border"
              }`}
            >
              Patient
            </button>
            <button
              onClick={() => setRole("nurse")}
              disabled={isLoading}
              className={`flex-1 rounded-lg py-2 font-semibold transition-all duration-300 ${
                role === "nurse" ? "bg-gradient-primary text-white" : "bg-surface-alt text-foreground hover:bg-border"
              }`}
            >
              Nurse
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  role === "doctor"
                    ? "doctor@safemedi.net"
                    : role === "patient"
                      ? "patient@safemedi.net"
                      : "nurse@safemedi.net"
                }
                className="input-field"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="input-field"
                disabled={isLoading}
              />
            </div>

            {error && <div className="rounded-lg bg-error/10 p-3 text-sm text-error">{error}</div>}

            <button type="submit" className="btn-primary w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-secondary">Demo credentials: 1234</p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-secondary">© SafeMediNet 2025 – Privacy Preserving EHR Platform</p>
      </div>
    </div>
  )
}
