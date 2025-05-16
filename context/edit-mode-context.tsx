"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"

// Define the context shape
interface EditModeContextType {
  isEditMode: boolean
  toggleEditMode: (password?: string) => void
  setEditMode: (isOn: boolean, password?: string) => void
  showAdminLogin: boolean
  setShowAdminLogin: (show: boolean) => void
  verifyPassword: (password: string) => boolean
  logout: () => void
}

// Create context with default values
const EditModeContext = createContext<EditModeContextType>({
  isEditMode: false,
  toggleEditMode: () => {},
  setEditMode: () => {},
  showAdminLogin: false,
  setShowAdminLogin: () => {},
  verifyPassword: () => false,
  logout: () => {}
})

// Hook for components to use the context
export const useEditMode = () => useContext(EditModeContext)

// Provider component
interface EditModeProviderProps {
  children: ReactNode
}

// This is a hash of the admin password - in production this should be in an environment variable
// Current password is: "mystic-admin-2025"
const ADMIN_PASSWORD = "mystic-admin-2025" // For demo purposes only

export function EditModeProvider({ children }: EditModeProviderProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  
  // Load from localStorage on initial render
  useEffect(() => {
    // Check for auth token instead of direct edit mode
    const authToken = localStorage.getItem('adminAuthToken')
    if (authToken) {
      // Verify the token is still valid (not expired)
      try {
        const tokenData = JSON.parse(atob(authToken))
        const now = new Date().getTime()
        
        if (tokenData.expires > now) {
          // Token is still valid
          setIsEditMode(true)
          console.log('Admin session restored')
        } else {
          // Token expired, remove it
          localStorage.removeItem('adminAuthToken')
          console.log('Admin session expired')
        }
      } catch (e) {
        // Invalid token format, remove it
        localStorage.removeItem('adminAuthToken')
        console.error('Invalid admin token', e)
      }
    }
  }, [])
  
  // Verify password against stored password
  const verifyPassword = (password: string): boolean => {
    // For demo purposes, we'll just check against our hardcoded password
    return password === ADMIN_PASSWORD
  }
  
  const toggleEditMode = (password?: string) => {
    if (isEditMode) {
      // Turning off edit mode doesn't require password
      logout()
      return
    }
    
    // Turning on edit mode requires password
    if (password && verifyPassword(password)) {
      setIsEditMode(true)
      setShowAdminLogin(false)
      
      // Create a session token that expires in 2 hours
      const expiryTime = new Date().getTime() + (2 * 60 * 60 * 1000)
      const tokenData = {
        expires: expiryTime,
        created: new Date().getTime()
      }
      
      // Store token in localStorage
      localStorage.setItem('adminAuthToken', btoa(JSON.stringify(tokenData)))
      
      // Log for debugging
      console.log('Admin mode enabled')
    } else if (!password) {
      // No password provided, show login dialog
      setShowAdminLogin(true)
    } else {
      // Incorrect password
      console.error('Invalid admin password')
      // Don't alert here - the login modal will handle the error display
    }
  }
  
  const setEditMode = (isOn: boolean, password?: string) => {
    if (isOn) {
      // Turning on requires password
      if (password && verifyPassword(password)) {
        setIsEditMode(true)
        setShowAdminLogin(false)
        
        // Create a session token that expires in 2 hours
        const expiryTime = new Date().getTime() + (2 * 60 * 60 * 1000)
        const tokenData = {
          expires: expiryTime,
          created: new Date().getTime()
        }
        
        // Store token in localStorage
        localStorage.setItem('adminAuthToken', btoa(JSON.stringify(tokenData)))
      } else if (!password) {
        setShowAdminLogin(true)
      }
    } else {
      // Turning off doesn't require password
      logout()
    }
  }
  
  const logout = () => {
    setIsEditMode(false)
    localStorage.removeItem('adminAuthToken')
    console.log('Admin mode disabled')
  }
  
  return (
    <EditModeContext.Provider value={{ 
      isEditMode, 
      toggleEditMode, 
      setEditMode, 
      showAdminLogin, 
      setShowAdminLogin,
      verifyPassword,
      logout
    }}>
      {children}
    </EditModeContext.Provider>
  )
}
