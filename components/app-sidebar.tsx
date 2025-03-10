"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, CreditCard, PieChart, Target, Settings, BarChart3, Lightbulb, Menu, X } from "lucide-react"
import { useState } from "react"

interface SidebarLink {
  title: string
  href: string
  icon: React.ElementType
}

const mainLinks: SidebarLink[] = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Transactions",
    href: "/dashboard/transactions",
    icon: CreditCard,
  },
  {
    title: "Budgets",
    href: "/dashboard/budgets",
    icon: PieChart,
  },
  {
    title: "Goals",
    href: "/dashboard/financial-goals",
    icon: Target,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

const aiLinks: SidebarLink[] = [
  {
    title: "Spending Analysis",
    href: "/dashboard/ai/spending-analysis",
    icon: BarChart3,
  },
  {
    title: "Smart Recommendations",
    href: "/dashboard/ai/recommendations",
    icon: Lightbulb,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`dashboard-sidebar ${isMobileMenuOpen ? "open" : ""}`}>
        <nav className="p-4">
          <div className="sidebar-section">
            <div className="sidebar-heading">Main</div>
            <ul>
              {mainLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`sidebar-link ${pathname === link.href ? "active" : ""}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <link.icon size={18} className="sidebar-icon" />
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-heading">AI Insights</div>
            <ul>
              {aiLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`sidebar-link ${pathname === link.href ? "active" : ""}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <link.icon size={18} className="sidebar-icon" />
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </aside>
    </>
  )
}

