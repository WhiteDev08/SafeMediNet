import type { ReactNode } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { NurseSidebar } from "@/components/nurse-sidebar"

export default function NurseLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requiredRole="nurse">
      <div className="flex min-h-screen bg-background">
        <NurseSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  )
}
