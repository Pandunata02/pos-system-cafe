"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Menu } from "lucide-react"
import { useSidebarToggle } from "./app-sidebar"

export function SidebarDemoInfo() {
  const { isHidden } = useSidebarToggle()
  const [showDemo, setShowDemo] = useState(true)

  useEffect(() => {
    // Hide demo after 10 seconds
    const timer = setTimeout(() => setShowDemo(false), 10000)
    return () => clearTimeout(timer)
  }, [])

  if (!showDemo) return null

  return (
    <Card className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-2">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Demo Info</Badge>
            <button onClick={() => setShowDemo(false)} className="ml-auto text-xs hover:text-red-500">
              ✕
            </button>
          </div>
          <div className="text-sm space-y-1">
            <p className="font-medium">Sidebar Controls:</p>
            <div className="flex items-center gap-2 text-xs">
              <ChevronLeft className="h-3 w-3" />
              <span>Click to hide sidebar</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Menu className="h-3 w-3" />
              <span>Click floating button to show full sidebar</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Current state:{" "}
              <Badge variant={isHidden ? "destructive" : "default"}>{isHidden ? "Hidden" : "Visible"}</Badge>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
