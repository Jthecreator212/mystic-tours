"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Edit, X, Check, Settings, ImageIcon, Wand2 } from "lucide-react"

interface AdminEditOverlayProps {
  enabled: boolean
}

export function AdminEditOverlay({ enabled }: AdminEditOverlayProps) {
  const router = useRouter()
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null)
  const [overlay, setOverlay] = useState<{ top: number; left: number; width: number; height: number } | null>(null)
  
  useEffect(() => {
    if (!enabled) return
    
    // Add event listeners for hovering over images
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      // Check if the target is an image or contains an image
      if (target.tagName === 'IMG' || target.querySelector('img')) {
        const imgElement = target.tagName === 'IMG' ? target : target.querySelector('img')
        if (imgElement) {
          setHoveredElement(imgElement as HTMLElement)
          
          // Get position for overlay
          const rect = imgElement.getBoundingClientRect()
          setOverlay({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height
          })
        }
      }
    }
    
    const handleMouseOut = (e: MouseEvent) => {
      const relatedTarget = e.relatedTarget as HTMLElement
      if (hoveredElement && !hoveredElement.contains(relatedTarget)) {
        setHoveredElement(null)
        setOverlay(null)
      }
    }
    
    const handleClick = (e: MouseEvent) => {
      if (hoveredElement) {
        e.preventDefault()
        e.stopPropagation()
        
        // Find the image source
        const imgSrc = hoveredElement.getAttribute('src')
        if (imgSrc) {
          // Extract image path from src
          const imagePath = imgSrc.startsWith('/') ? imgSrc : `/${imgSrc}`
          
          // Find the image in the admin system by path
          // For demo purposes, we'll use a mock ID based on the path
          const mockId = btoa(imagePath).replace(/=/g, '').substring(0, 8)
          
          // Navigate to the edit page
          router.push(`/admin/images/edit/${mockId}?path=${encodeURIComponent(imagePath)}`)
        }
      }
    }
    
    // Add event listeners to document
    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)
    document.addEventListener('click', handleClick)
    
    // Add admin mode indicator
    const indicator = document.createElement('div')
    indicator.className = 'fixed bottom-4 right-4 bg-[#1a5d1a] text-white px-3 py-2 rounded-md shadow-lg z-50 flex items-center'
    indicator.innerHTML = `
      <span class="mr-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wand-2">
          <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"></path>
          <path d="m14 7 3 3"></path>
          <path d="M5 6v4"></path>
          <path d="M19 14v4"></path>
          <path d="M10 2v2"></path>
          <path d="M7 8H3"></path>
          <path d="M21 16h-4"></path>
          <path d="M11 3v2"></path>
        </svg>
      </span>
      Direct Edit Mode
      <a href="/admin/images" class="ml-2 bg-white text-[#1a5d1a] p-1 rounded-md text-xs">Exit</a>
    `
    document.body.appendChild(indicator)
    
    return () => {
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
      document.removeEventListener('click', handleClick)
      document.body.removeChild(indicator)
    }
  }, [enabled, hoveredElement, router])
  
  if (!enabled || !overlay) return null
  
  return (
    <div 
      className="fixed z-50 pointer-events-none"
      style={{
        top: `${overlay.top}px`,
        left: `${overlay.left}px`,
        width: `${overlay.width}px`,
        height: `${overlay.height}px`
      }}
    >
      <div className="absolute inset-0 border-2 border-[#e9b824] bg-[#1a5d1a]/10"></div>
      
      <div className="absolute -top-10 left-0 flex items-center gap-2 pointer-events-auto">
        <button 
          className="bg-[#1a5d1a] text-white p-2 rounded-md hover:bg-[#4e9f3d] transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            if (hoveredElement) {
              const imgSrc = hoveredElement.getAttribute('src')
              if (imgSrc) {
                const imagePath = imgSrc.startsWith('/') ? imgSrc : `/${imgSrc}`
                const mockId = btoa(imagePath).replace(/=/g, '').substring(0, 8)
                router.push(`/admin/images/edit/${mockId}?path=${encodeURIComponent(imagePath)}`)
              }
            }
          }}
        >
          <Edit size={16} />
        </button>
        <span className="bg-white px-2 py-1 rounded-md text-xs text-[#1a5d1a] shadow-md">
          Click to edit this image
        </span>
      </div>
    </div>
  )
}
