"use client"

import { useState } from 'react'
import { useEditMode } from '@/context/edit-mode-context'
import { X, Lock, Eye, EyeOff } from 'lucide-react'

export function AdminLoginModal() {
  const { showAdminLogin, setShowAdminLogin, toggleEditMode } = useEditMode()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (!showAdminLogin) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!password) {
      setError('Please enter your password')
      return
    }
    
    setIsLoading(true)
    
    try {
      // Small delay to simulate authentication
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Try to enable edit mode with the provided password
      toggleEditMode(password)
      
      // If we're still showing the login modal, the password was incorrect
      if (showAdminLogin) {
        setError('Invalid password')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred during authentication')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button 
          onClick={() => setShowAdminLogin(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        
        <div className="text-center mb-6">
          <div className="bg-[#1a5d1a] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Lock className="text-white" size={28} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Access</h2>
          <p className="text-gray-600 mt-1">Enter your password to enable edit mode</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1a5d1a] focus:border-[#1a5d1a] outline-none"
                placeholder="Enter your admin password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1a5d1a] hover:bg-[#164a16] text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                Authenticating...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
