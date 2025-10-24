"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart, BarChart3, Settings, LogOut, Menu, X } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export function NurseSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: "/nurse/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/nurse/vitals", label: "IoMT Parameters", icon: Heart },
    { href: "/nurse/settings", label: "Settings", icon: Settings },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-gradient-primary p-2 text-white md:hidden"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 transform bg-surface transition-transform duration-300 md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="border-b border-border p-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-lg bg-gradient-primary p-2">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-foreground">SafeMediNet</h1>
                <p className="text-xs text-secondary">Nurse Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${
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
          <div className="border-t border-border p-4">
            <button
              onClick={() => {
                logout()
                setIsOpen(false)
              }}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-foreground transition-all duration-200 hover:bg-surface-alt"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
