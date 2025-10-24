"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { AuthUser, UserRole } from "@/lib/auth"
import { getStoredUser, clearStoredUser, setStoredUser, validateCredentials, ROLE_ROUTES } from "@/lib/auth"

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = getStoredUser()
    setUser(storedUser)
    setIsLoading(false)
  }, [])

  const login = (email: string, password: string) => {
    const role = validateCredentials(email, password)
    if (role) {
      setStoredUser(email, role)
      setUser({ email, role })
      router.push(ROLE_ROUTES[role])
      return true
    }
    return false
  }

  const logout = () => {
    clearStoredUser()
    setUser(null)
    router.push("/")
  }

  const hasRole = (requiredRole: UserRole | UserRole[]) => {
    if (!user) return false
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role)
    }
    return user.role === requiredRole
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole,
  }
}
