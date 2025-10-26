"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, LayoutDashboard, Users, FileText, AlertCircle, User, Activity, Lock } from "lucide-react"

interface SidebarProps {
  role: "doctor" | "patient"
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const doctorMenuItems = [
    { href: "/doctor/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/doctor/patients", label: "Patients", icon: Users },
    { href: "/doctor/ehr", label: "EHR Access", icon: FileText },
    { href: "/doctor/logs", label: "Logs", icon: Activity },
    { href: "/doctor/alerts", label: "Alerts", icon: AlertCircle },
    { href: "/doctor/profile", label: "Profile", icon: User },
  ]

  const patientMenuItems = [
    { href: "/patient/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/patient/vitals", label: "My Vitals", icon: Activity },
    { href: "/patient/access-control", label: "Access Control", icon: Lock },
    { href: "/patient/logs", label: "Logs", icon: FileText },
    { href: "/patient/profile", label: "Profile", icon: User },
  ]

  const menuItems = role === "doctor" ? doctorMenuItems : patientMenuItems

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userEmail")
    router.push("/")
  }

  return (
    <div className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-surface p-6 shadow-sm">
      {/* Logo */}
      <Link
        href={role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard"}
        className="mb-8 flex items-center gap-2"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
          <span className="text-lg font-bold text-white">S</span>
        </div>
        <span className="font-bold text-foreground">SafeMediNet</span>
      </Link>

      {/* Menu Items */}
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-300 ${
                isActive ? "bg-gradient-primary text-white shadow-md" : "text-foreground hover:bg-surface-alt"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="absolute bottom-6 left-6 right-6 flex items-center gap-3 rounded-lg bg-error/10 px-4 py-3 text-error transition-all duration-300 hover:bg-error/20"
      >
        <LogOut className="h-5 w-5" />
        <span className="font-medium">Logout</span>
      </button>
    </div>
  )
}
