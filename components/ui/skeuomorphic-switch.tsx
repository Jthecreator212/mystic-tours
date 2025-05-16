"use client"

import { useState, useEffect } from "react"
import { Edit, Check } from "lucide-react"

interface SkeuomorphicSwitchProps {
  isOn?: boolean
  onChange?: (isOn: boolean) => void
  label?: string
  size?: "sm" | "md" | "lg"
}

export function SkeuomorphicSwitch({ 
  isOn = false, 
  onChange, 
  label = "Edit Mode", 
  size = "md" 
}: SkeuomorphicSwitchProps) {
  const [isActive, setIsActive] = useState(isOn)
  
  // Sync with external state
  useEffect(() => {
    setIsActive(isOn)
  }, [isOn])
  
  const handleToggle = () => {
    const newState = !isActive
    setIsActive(newState)
    onChange?.(newState)
  }
  
  // Size-based styling
  const getSizeClasses = () => {
    switch(size) {
      case "sm": 
        return {
          container: "w-14 h-7",
          toggle: "w-5 h-5 translate-x-[0.35rem]",
          toggleActive: "translate-x-[0.65rem]",
          icon: "w-3 h-3"
        }
      case "lg":
        return {
          container: "w-24 h-12",
          toggle: "w-10 h-10 translate-x-[0.5rem]",
          toggleActive: "translate-x-[1.8rem]",
          icon: "w-6 h-6"
        }
      default: // md
        return {
          container: "w-20 h-10",
          toggle: "w-8 h-8 translate-x-[0.4rem]",
          toggleActive: "translate-x-[1.5rem]",
          icon: "w-5 h-5"
        }
    }
  }
  
  const sizeClasses = getSizeClasses()
  
  return (
    <div className="flex items-center space-x-2">
      {label && (
        <span className="text-sm font-medium text-[#e9b824]">{label}</span>
      )}
      <div 
        className={`relative cursor-pointer rounded-full ${sizeClasses.container} ${
          isActive 
            ? "bg-gradient-to-r from-[#1a5d1a] to-[#2c8c2c] shadow-inner" 
            : "bg-gradient-to-r from-[#5e5e5e] to-[#3d3d3d] shadow-inner"
        } transition-colors duration-300`}
        onClick={handleToggle}
      >
        {/* Notches/ticks for skeuomorphic feel */}
        <div className="absolute inset-0 flex justify-between px-1.5 py-2 opacity-30">
          <div className="flex flex-col justify-between h-full">
            <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
          </div>
          <div className="flex flex-col justify-between h-full">
            <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
          </div>
        </div>
        
        {/* Toggle knob */}
        <div 
          className={`absolute top-1/2 -translate-y-1/2 ${sizeClasses.toggle} ${
            isActive ? sizeClasses.toggleActive : ""
          } rounded-full bg-gradient-to-b from-[#f8f8f8] to-[#e0e0e0] shadow-lg transform transition-transform duration-300 flex items-center justify-center`}
        >
          {/* Metallic effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/80 to-transparent opacity-80"></div>
          <div className="absolute top-0.5 left-0.5 right-0.5 h-1/3 bg-white/30 rounded-t-full"></div>
          
          {/* Icon */}
          {isActive ? (
            <Check className={`${sizeClasses.icon} text-[#1a5d1a] relative z-10`} />
          ) : (
            <Edit className={`${sizeClasses.icon} text-[#5e5e5e] relative z-10`} />
          )}
        </div>
        
        {/* ON/OFF labels */}
        <div className="absolute inset-0 flex justify-between items-center px-1.5 text-[8px] font-bold">
          <span className={`ml-1 ${isActive ? 'opacity-0' : 'opacity-70'} text-white transition-opacity duration-300`}>OFF</span>
          <span className={`mr-1 ${isActive ? 'opacity-70' : 'opacity-0'} text-white transition-opacity duration-300`}>ON</span>
        </div>
      </div>
    </div>
  )
}
