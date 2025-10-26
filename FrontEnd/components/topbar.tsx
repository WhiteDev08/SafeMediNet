"use client"

import { useEffect, useState } from "react"
import { User, Bell } from "lucide-react"

interface TopbarProps {
  title: string
  role: "doctor" | "patient"
}

export function Topbar({ title, role }: TopbarProps) {
  const [email, setEmail] = useState("")

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail") || "User"
    setEmail(storedEmail)
  }, [])

  return (
    <div className="flex items-center justify-between border-b border-border bg-surface px-8 py-4 shadow-sm">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <div className="flex items-center gap-6">
        <button className="relative rounded-full p-2 hover:bg-surface-alt">
          <Bell className="h-6 w-6 text-secondary" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-error"></span>
        </button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-foreground">{email.split("@")[0]}</p>
            <p className="text-xs text-secondary capitalize">{role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
