"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useSidebarToggle } from "./app-sidebar"

export function SidebarToggleButton() {
  const { isHidden, toggleHidden } = useSidebarToggle()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(isHidden)
  }, [isHidden])

  if (!isVisible) return null

  const handleToggle = () => {
    toggleHidden() // This will show the full sidebar with animation
  }

  return (
    <div className="fixed left-4 top-4 z-50 transition-all duration-300 ease-in-out">
      <Button
        onClick={handleToggle}
        size="sm"
        className="shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
        aria-label="Show navigation"
        title="Click to show navigation menu"
      >
        <Menu className="h-4 w-4" />
        <span className="ml-2 text-xs hidden sm:inline">Show Navigation</span>
      </Button>
    </div>
  )
}
