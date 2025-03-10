import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {/* Header spacer */}
      <div className="h-14" />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-14 bottom-0 w-64 bg-white border-r border-[#e6dfd5]">
        <AppSidebar />
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <div className="max-w-7xl mx-auto px-6 pt-4 pb-8">
          <main>{children}</main>
        </div>
      </div>
    </div>
  )
}

