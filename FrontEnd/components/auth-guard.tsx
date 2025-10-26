"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import type { UserRole } from "@/lib/auth"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole | UserRole[]
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter()
  const { user, isLoading, hasRole } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push("/")
      return
    }

    if (requiredRole && !hasRole(requiredRole)) {
      router.push("/")
      return
    }
  }, [user, isLoading, requiredRole, hasRole, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"></div>
          <p className="text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || (requiredRole && !hasRole(requiredRole))) {
    return null
  }

  return <>{children}</>
}
