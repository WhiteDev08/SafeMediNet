// lib/auth.ts - Firebase-connected Authentication
import { handleLogin } from '../firebase'

export type UserRole = "doctor" | "patient" | "nurse"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
}

/**
 * Validates credentials against Firebase
 * Also calls backend /update_login API for threat detection
 */
export async function validateCredentials(
  userId: string,
  password: string,
  role: UserRole
): Promise<AuthUser | null> {
  try {
    const result = await handleLogin(userId, password, role);
    
    if (result.success && result.userData) {
      return result.userData;
    }
    
    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

/**
 * Gets stored user from localStorage
 */
export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null
  
  const userJson = localStorage.getItem("safemedi_user")
  if (userJson) {
    try {
      return JSON.parse(userJson) as AuthUser
    } catch {
      return null
    }
  }
  return null
}

/**
 * Stores user in localStorage
 */
export function setStoredUser(user: AuthUser): void {
  if (typeof window === "undefined") return
  localStorage.setItem("safemedi_user", JSON.stringify(user))
}

/**
 * Clears stored user from localStorage
 */
export function clearStoredUser(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("safemedi_user")
}

/**
 * Role-based route mapping
 */
export const ROLE_ROUTES: Record<UserRole, string> = {
  doctor: "/doctor/dashboard",
  patient: "/patient/dashboard",
  nurse: "/nurse/dashboard",
}