"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Image as ImageIcon, 
  Home, 
  Users, 
  Calendar, 
  Settings,
  Menu,
  X
} from "lucide-react"

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f8ede3] flex">
      {/* Mobile sidebar toggle */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 bg-[#1a5d1a] text-white p-2 rounded-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 transform md:relative md:translate-x-0 transition duration-200 ease-in-out z-30
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        w-64 bg-[#1a5d1a] text-[#f8ede3] p-6 flex flex-col
      `}>
        <div className="text-xl font-bold mb-8 flex items-center">
          <ImageIcon className="mr-2 text-[#e9b824]" />
          <span>Mystic Admin</span>
        </div>
        
        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <Link 
                href="/admin" 
                className="flex items-center p-2 rounded-md hover:bg-[#4e9f3d] transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <Home className="mr-2 text-[#e9b824]" size={18} />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/images" 
                className="flex items-center p-2 rounded-md hover:bg-[#4e9f3d] transition-colors bg-[#4e9f3d]"
                onClick={() => setSidebarOpen(false)}
              >
                <ImageIcon className="mr-2 text-[#e9b824]" size={18} />
                <span>Image Management</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/users" 
                className="flex items-center p-2 rounded-md hover:bg-[#4e9f3d] transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <Users className="mr-2 text-[#e9b824]" size={18} />
                <span>Users</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/bookings" 
                className="flex items-center p-2 rounded-md hover:bg-[#4e9f3d] transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <Calendar className="mr-2 text-[#e9b824]" size={18} />
                <span>Bookings</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/settings" 
                className="flex items-center p-2 rounded-md hover:bg-[#4e9f3d] transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <Settings className="mr-2 text-[#e9b824]" size={18} />
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="mt-auto pt-4 border-t border-[#4e9f3d]">
          <Link 
            href="/" 
            className="flex items-center p-2 rounded-md hover:bg-[#4e9f3d] transition-colors"
          >
            <span>Return to Website</span>
          </Link>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 md:ml-64 p-6">
        {children}
      </div>
    </div>
  )
}
