import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <div className="dashboard-content">
        <header className="dashboard-header">
          <div className="flex items-center">
            <h1 className="text-lg font-medium text-[#3a3027]">BreadAI Finance</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-[#e8e1d9] flex items-center justify-center text-[#9c6644] font-medium">
              <span className="text-sm">JD</span>
            </div>
          </div>
        </header>
        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  )
}

