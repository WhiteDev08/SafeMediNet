import type React from "react"
import { PatientSidebar } from "@/components/patient-sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { PatientChatbot } from "@/components/patient-chatbot"

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requiredRole="patient">
      <div className="flex">
        <PatientSidebar />
        <main className="flex-1 overflow-auto bg-background">{children}</main>
        <PatientChatbot />
      </div>
    </AuthGuard>
  )
}
