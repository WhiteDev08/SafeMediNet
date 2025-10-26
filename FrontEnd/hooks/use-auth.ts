// hooks/use-auth.ts - Firebase-connected Auth Hook
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { AuthUser, UserRole } from "@/lib/auth"
import { 
  getStoredUser, 
  clearStoredUser, 
  setStoredUser, 
  validateCredentials, 
  ROLE_ROUTES 
} from "@/lib/auth"

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = getStoredUser()
    setUser(storedUser)
    setIsLoading(false)
  }, [])

  /**
   * Login with Firebase authentication
   * @param userId - User ID (e.g., "DOC001", "NURSE001", "PAT001")
   * @param password - Plain text password
   * @param role - User role
   */
  const login = async (
    userId: string, 
    password: string, 
    role: UserRole
  ): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // Validate against Firebase (also calls backend /update_login)
      const authenticatedUser = await validateCredentials(userId, password, role)
      
      if (authenticatedUser) {
        // Store user and redirect to portal
        setStoredUser(authenticatedUser)
        setUser(authenticatedUser)
        router.push(ROLE_ROUTES[role])
        setIsLoading(false)
        return true
      }
      
      setIsLoading(false)
      return false
    } catch (error) {
      console.error('Login failed:', error)
      setIsLoading(false)
      return false
    }
  }

  /**
   * Signup new user
   * @param userData - User signup data
   * @param role - User role
   */
  const signup = async (
    userData: any,
    role: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      
      // Import createUser from firebase
      const { createUser, createDoctor, createNurse, createPatient } = await import('../firebase')
      
      // Create user based on role
      if (role === 'doctor') {
        await createDoctor(userData)
      } else if (role === 'nurse') {
        await createNurse(userData)
      } else if (role === 'patient') {
        await createPatient(userData)
      }
      
      setIsLoading(false)
      return { success: true }
    } catch (error: any) {
      console.error('Signup failed:', error)
      setIsLoading(false)
      return { 
        success: false, 
        error: error.message || 'Failed to create account. User ID may already exist.' 
      }
    }
  }

  /**
   * Logout and clear session
   */
  const logout = () => {
    clearStoredUser()
    setUser(null)
    router.push("/")
  }

  /**
   * Check if user has required role
   */
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
    signup,
    logout,
    hasRole,
  }
}