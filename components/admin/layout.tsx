"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Menu, 
  Home, 
  Plus, 
  Upload, 
  Users, 
  Settings, 
  LogOut,
  Image,
  BarChart,
  Calendar
} from "lucide-react"
import Link from "next/link"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const sidebarWidth = isSidebarOpen ? "w-64" : "w-16"
  const mainMargin = isSidebarOpen ? "ml-64" : "ml-16"

  return (
    <div className="flex h-screen bg-[#f8f5f0]">
      {/* Sidebar */}
      <aside 
        className={`bg-[#1a5d1a] text-white transition-all duration-300 ${sidebarWidth} fixed h-full overflow-y-auto`}
        style={{ zIndex: 1000 }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">Admin</span>
              <span className="text-sm">Portal</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded hover:bg-[#009b3a] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            <Link href="/admin">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:bg-[#009b3a] transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/admin/images">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:bg-[#009b3a] transition-colors"
              >
                <Image className="w-4 h-4 mr-2" />
                Image Manager
              </Button>
            </Link>
            <Link href="/admin/tours">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:bg-[#009b3a] transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tours
              </Button>
            </Link>
            <Link href="/admin/bookings">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:bg-[#009b3a] transition-colors"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Bookings
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:bg-[#009b3a] transition-colors"
              >
                <Users className="w-4 h-4 mr-2" />
                Users
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:bg-[#009b3a] transition-colors"
              >
                <BarChart className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:bg-[#009b3a] transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className={`flex-1 transition-all duration-300 ${mainMargin} bg-[#f8f5f0] p-8`}
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-[#1a5d1a]">Dashboard</h1>
          </div>
          <div className="flex space-x-4">
            <Button 
              variant="outline" 
              className="bg-[#e9b824] text-[#1a5d1a] hover:bg-[#fed100] transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
            <Button 
              variant="default"
              className="bg-[#1a5d1a] hover:bg-[#009b3a] transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>
        </div>

        {children}
      </main>
    </div>
  )
}
