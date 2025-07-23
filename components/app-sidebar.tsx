"use client"

import type * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import {
  BarChart3,
  FileText,
  Home,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
  Activity,
  Clock,
  ChevronLeft,
} from "lucide-react"

import type { Sidebar } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRole: "cashier" | "owner"
}

export function AppSidebar({ userRole, ...props }: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isHidden, setIsHidden] = useState(false)
  const username = typeof window !== "undefined" ? localStorage.getItem("username") || "User" : "User"

  // Load hidden state from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("sidebar-hidden")
      setIsHidden(savedState === "true")
    }
  }, [])

  // Save hidden state to localStorage
  const toggleHidden = () => {
    const newHiddenState = !isHidden
    setIsHidden(newHiddenState)
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-hidden", newHiddenState.toString())
      // Dispatch custom event for other components to listen
      window.dispatchEvent(new CustomEvent("sidebar-toggle", { detail: { isHidden: newHiddenState } }))
    }
  }

  const cashierNavItems = [
    {
      title: "Dashboard",
      url: "/cashier/dashboard",
      icon: Home,
    },
    {
      title: "New Order",
      url: "/cashier/orders",
      icon: ShoppingCart,
    },
    {
      title: "Daily Report",
      url: "/cashier/reports",
      icon: FileText,
    },
    {
      title: "Stock View",
      url: "/cashier/stock",
      icon: Package,
    },
    {
      title: "Tables",
      url: "/cashier/tables",
      icon: Users,
    },
  ]

  const ownerNavItems = [
    {
      title: "Dashboard",
      url: "/owner/dashboard",
      icon: Home,
    },
    {
      title: "Orders",
      url: "/owner/orders",
      icon: ShoppingCart,
    },
    {
      title: "Reports",
      url: "/owner/reports",
      icon: FileText,
    },
    {
      title: "Stock Management",
      url: "/owner/stock",
      icon: Package,
    },
    {
      title: "Stock Movements",
      url: "/owner/movements",
      icon: Activity,
    },
    {
      title: "Analysis",
      url: "/owner/analysis",
      icon: BarChart3,
    },
    {
      title: "Login History",
      url: "/owner/login-history",
      icon: Clock,
    },
    {
      title: "Settings",
      url: "/owner/settings",
      icon: Settings,
    },
  ]

  const navItems = userRole === "cashier" ? cashierNavItems : ownerNavItems

  const handleLogout = () => {
    // Record logout time
    const loginHistory = JSON.parse(localStorage.getItem("loginHistory") || "[]")
    const currentSession = loginHistory.find((session: any) => !session.logoutTime && session.username === username)

    if (currentSession) {
      currentSession.logoutTime = new Date().toISOString()
      localStorage.setItem("loginHistory", JSON.stringify(loginHistory))
    }

    localStorage.removeItem("userRole")
    localStorage.removeItem("username")
    router.push("/")
  }

  return (
    <div
      className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out transform ${
        isHidden ? "-translate-x-full" : "translate-x-0"
      }`}
      style={{ width: "16rem" }}
    >
      <div className="h-full w-full bg-white border-r shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <TrendingUp className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">POS System</span>
              <span className="truncate text-xs capitalize text-muted-foreground">{userRole} Panel</span>
            </div>
            {/* Hide sidebar button */}
            <button
              onClick={toggleHidden}
              className="ml-auto p-1 rounded-md hover:bg-gray-200 transition-all duration-200 hover:scale-110"
              aria-label="Hide sidebar"
              title="Hide sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            <div className="px-2 py-1">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Navigation</h2>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.title}
                  onClick={() => router.push(item.url)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === item.url
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{username}</p>
              <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Export the toggle function and state for use in other components
export function useSidebarToggle() {
  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("sidebar-hidden")
      setIsHidden(savedState === "true")

      // Listen for sidebar toggle events
      const handleSidebarToggle = (event: CustomEvent) => {
        setIsHidden(event.detail.isHidden)
      }

      window.addEventListener("sidebar-toggle", handleSidebarToggle as EventListener)

      return () => {
        window.removeEventListener("sidebar-toggle", handleSidebarToggle as EventListener)
      }
    }
  }, [])

  const toggleHidden = () => {
    const newHiddenState = !isHidden
    setIsHidden(newHiddenState)
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-hidden", newHiddenState.toString())
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent("sidebar-toggle", { detail: { isHidden: newHiddenState } }))
    }
  }

  return { isHidden, toggleHidden }
}
