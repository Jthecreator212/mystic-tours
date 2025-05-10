"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Settings, ImageIcon, Folder, Users, Calendar, LogOut, Plus, Upload, Trash2, Edit2, Menu, Home } from "lucide-react"
import { adminStyles } from "./styles"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activePath, setActivePath] = useState<string>("")

  useEffect(() => {
    setActivePath(window.location.pathname)
    const handleRouteChange = () => {
      setActivePath(window.location.pathname)
    }
    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  const menuItems = [
    { title: "Home", href: "/", icon: Home },
    { title: "Dashboard", href: "/admin", icon: Settings },
    { title: "Image Manager", href: "/admin/images", icon: ImageIcon },
    { title: "Tours", href: "/admin/tours", icon: Calendar },
    { title: "Users", href: "/admin/users", icon: Users },
  ]

  return (
    <div className="flex h-screen bg-[#f8f5f0]">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 ${adminStyles.sidebar} transition-all duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className={`${adminStyles.sidebarHeader} flex items-center`}>
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        <nav className="pt-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${adminStyles.sidebarLink} ${
                    activePath === item.href ? adminStyles.sidebarActive : ""
                  }`}
                  onClick={() => setActivePath(item.href)}
                >
                  <item.icon className={`${adminStyles.sidebarIcon} ${
                    activePath === item.href ? "text-white" : "text-[#fed100]"
                  }`} />
                  <span className={`${
                    activePath === item.href ? "text-white" : "text-[#fed100]"
                  }`}>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ml-64 ${adminStyles.mainContent} transition-all duration-300`}>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded hover:bg-[#1a5d1a] hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-[#1a5d1a]">{menuItems.find(item => activePath.includes(item.href))?.title || "Admin Dashboard"}</h1>
          </div>
          <div className="flex space-x-4">
            <button className={`${adminStyles.button.primary} flex items-center`}>
              <Plus className="w-5 h-5 mr-2" />
              Add New
            </button>
            <button className={`${adminStyles.button.secondary} flex items-center`}>
              <Upload className="w-5 h-5 mr-2" />
              Import
            </button>
            <button
              onClick={() => {
                // Add logout functionality here
                console.log('Logout clicked')
              }}
              className={`${adminStyles.button.secondary} flex items-center`}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
