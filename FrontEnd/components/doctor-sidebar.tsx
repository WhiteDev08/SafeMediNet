"use client"

import { Heart, LogOut, Settings, Users, FileText, Activity } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { SidebarNav } from "./sidebar-nav"

export function DoctorSidebar() {
  const { logout, user } = useAuth()

  const navItems = [
    { label: "Dashboard", href: "/doctor/dashboard", icon: <Activity className="h-5 w-5" /> },
    { label: "Patients", href: "/doctor/patients", icon: <Users className="h-5 w-5" /> },
    { label: "EHR Records", href: "/doctor/ehr", icon: <FileText className="h-5 w-5" /> },
    { label: "Settings", href: "/doctor/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-surface">
      {/* Logo */}
      <div className="border-b border-border px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded-lg bg-gradient-primary p-2">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gradient-primary">SafeMediNet</h1>
            <p className="text-xs text-secondary">Doctor Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <SidebarNav items={navItems} />
      </div>

      {/* User Info & Logout */}
      <div className="border-t border-border px-4 py-4">
        <div className="mb-4 rounded-lg bg-surface-alt p-3">
          <p className="text-xs text-secondary">Logged in as</p>
          <p className="truncate text-sm font-semibold text-foreground">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-secondary transition-all duration-200 hover:bg-surface-alt hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
