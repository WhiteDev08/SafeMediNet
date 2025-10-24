// Authentication utilities and role-based access control

export type UserRole = "doctor" | "patient" | "nurse" | "admin"

export interface AuthUser {
  email: string
  role: UserRole
}

export const AUTH_CREDENTIALS = {
  doctor: { email: "doctor@safemedi.net", password: "1234" },
  patient: { email: "patient@safemedi.net", password: "1234" },
  nurse: { email: "nurse@safemedi.net", password: "1234" },
  admin: { email: "admin@safemedi.net", password: "1234" },
}

export function validateCredentials(email: string, password: string): UserRole | null {
  for (const [role, creds] of Object.entries(AUTH_CREDENTIALS)) {
    if (email === creds.email && password === creds.password) {
      return role as UserRole
    }
  }
  return null
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null
  const role = localStorage.getItem("userRole")
  const email = localStorage.getItem("userEmail")
  if (role && email) {
    return { email, role: role as UserRole }
  }
  return null
}

export function setStoredUser(email: string, role: UserRole): void {
  if (typeof window === "undefined") return
  localStorage.setItem("userRole", role)
  localStorage.setItem("userEmail", email)
}

export function clearStoredUser(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("userRole")
  localStorage.removeItem("userEmail")
}

export const ROLE_ROUTES: Record<UserRole, string> = {
  doctor: "/doctor/dashboard",
  patient: "/patient/dashboard",
  nurse: "/nurse/dashboard",
  admin: "/admin/dashboard",
}
