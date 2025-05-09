"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { AdminEditOverlay } from "@/components/admin-edit-overlay"

// Create context for direct edit mode
type DirectEditContextType = {
  directEditMode: boolean
  enableDirectEdit: () => void
  disableDirectEdit: () => void
}

const DirectEditContext = createContext<DirectEditContextType>({
  directEditMode: false,
  enableDirectEdit: () => {},
  disableDirectEdit: () => {}
})

// Hook to use the direct edit context
export const useDirectEdit = () => useContext(DirectEditContext)

// Provider component
export function DirectEditProvider({ children }: { children: React.ReactNode }) {
  const [directEditMode, setDirectEditMode] = useState(false)
  
  // Check local storage for saved state on mount
  useEffect(() => {
    const savedState = localStorage.getItem("mysticTours_directEditMode")
    if (savedState === "true") {
      setDirectEditMode(true)
    }
  }, [])
  
  // Enable direct edit mode
  const enableDirectEdit = () => {
    setDirectEditMode(true)
    localStorage.setItem("mysticTours_directEditMode", "true")
  }
  
  // Disable direct edit mode
  const disableDirectEdit = () => {
    setDirectEditMode(false)
    localStorage.setItem("mysticTours_directEditMode", "false")
  }
  
  return (
    <DirectEditContext.Provider value={{ directEditMode, enableDirectEdit, disableDirectEdit }}>
      {children}
      <AdminEditOverlay enabled={directEditMode} />
    </DirectEditContext.Provider>
  )
}
