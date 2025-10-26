import type React from "react"
import { DoctorSidebar } from "@/components/doctor-sidebar"
import { AuthGuard } from "@/components/auth-guard"

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requiredRole="doctor">
      <div className="flex">
        <DoctorSidebar />
        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>
    </AuthGuard>
  )
}
