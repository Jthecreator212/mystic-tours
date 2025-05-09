"use client"

import { Card } from "@/components/ui/card"
import { 
  Image as ImageIcon, 
  Users, 
  Calendar, 
  Settings,
  ArrowUpRight
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const stats = [
    { 
      title: "Total Images", 
      value: "87", 
      icon: <ImageIcon className="text-[#e9b824]" />, 
      link: "/admin/images",
      color: "bg-gradient-to-br from-[#1a5d1a] to-[#4e9f3d]"
    },
    { 
      title: "Users", 
      value: "12", 
      icon: <Users className="text-[#e9b824]" />, 
      link: "/admin/users",
      color: "bg-gradient-to-br from-[#85603f] to-[#d83f31]"
    },
    { 
      title: "Bookings", 
      value: "48", 
      icon: <Calendar className="text-[#e9b824]" />, 
      link: "/admin/bookings",
      color: "bg-gradient-to-br from-[#e9b824] to-[#d83f31]"
    },
    { 
      title: "Settings", 
      value: "", 
      icon: <Settings className="text-[#e9b824]" />, 
      link: "/admin/settings",
      color: "bg-gradient-to-br from-[#1a5d1a] to-[#85603f]"
    }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1a5d1a] mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Link href={stat.link} key={index}>
            <Card className={`${stat.color} text-white p-6 transition-transform hover:scale-105`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium opacity-80">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  {stat.icon}
                </div>
              </div>
              {stat.title !== "Settings" && (
                <div className="mt-4 flex items-center text-sm">
                  <span>View details</span>
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </div>
              )}
            </Card>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-[#1a5d1a] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/admin/images/upload" 
            className="bg-[#1a5d1a] text-white py-3 px-4 rounded-md text-center hover:bg-[#4e9f3d] transition-colors"
          >
            Upload New Images
          </Link>
          <Link 
            href="/admin/images/categories" 
            className="bg-[#e9b824] text-[#1a5d1a] py-3 px-4 rounded-md text-center hover:bg-[#fed100] transition-colors"
          >
            Manage Image Categories
          </Link>
          <Link 
            href="/admin/images/optimize" 
            className="bg-[#85603f] text-white py-3 px-4 rounded-md text-center hover:bg-[#d83f31] transition-colors"
          >
            Optimize Images
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-[#1a5d1a] mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-[#f8ede3] rounded-md">
            <div className="flex items-center">
              <ImageIcon className="mr-3 text-[#1a5d1a]" />
              <span>New hero image uploaded</span>
            </div>
            <span className="text-sm text-[#85603f]">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#f8ede3] rounded-md">
            <div className="flex items-center">
              <ImageIcon className="mr-3 text-[#1a5d1a]" />
              <span>Gallery images updated</span>
            </div>
            <span className="text-sm text-[#85603f]">Yesterday</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#f8ede3] rounded-md">
            <div className="flex items-center">
              <ImageIcon className="mr-3 text-[#1a5d1a]" />
              <span>Testimonial photos replaced</span>
            </div>
            <span className="text-sm text-[#85603f]">3 days ago</span>
          </div>
        </div>
      </div>
    </div>
  )
}
