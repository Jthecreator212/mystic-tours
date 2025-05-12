"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  FileText,
  Plus,
  Image,
  Map,
  Activity,
  BookOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DashboardMetrics {
  totalTours: number
  totalUsers: number
  totalBookings: number
  revenue: number
  activeTours: number
  upcomingTours: number
  recentBookings: Array<{
    id: number
    tourName: string
    customerName: string
    date: string
    amount: number
  }>
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalTours: 0,
    totalUsers: 0,
    totalBookings: 0,
    revenue: 0,
    activeTours: 0,
    upcomingTours: 0,
    recentBookings: []
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockData: DashboardMetrics = {
        totalTours: 45,
        totalUsers: 125,
        totalBookings: 215,
        revenue: 45895.50,
        activeTours: 12,
        upcomingTours: 18,
        recentBookings: [
          {
            id: 1,
            tourName: "Blue Mountain Tour",
            customerName: "John Smith",
            date: "2025-05-10",
            amount: 1599.99
          },
          {
            id: 2,
            tourName: "Dunn's River Falls Experience",
            customerName: "Sarah Johnson",
            date: "2025-05-12",
            amount: 2499.99
          },
          {
            id: 3,
            tourName: "Montego Bay Adventure",
            customerName: "Michael Chen",
            date: "2025-05-15",
            amount: 3499.99
          }
        ]
      }
      setMetrics(mockData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <h1 className="text-3xl font-bold text-[#1a5d1a]">Welcome to Your Dashboard</h1>
        <div className="flex-1"></div>
        <div className="flex gap-2">
          <Link href="/admin/tours/new">
            <Button variant="outline" className="bg-[#e9b824] text-[#1a5d1a] hover:bg-[#fed100]">
              <Plus className="w-4 h-4 mr-2" />
              New Tour
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tours</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTours}</div>
            <p className="text-xs text-muted-foreground">Active tours: {metrics.activeTours}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">New this month: 35</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalBookings}</div>
            <p className="text-xs text-muted-foreground">Upcoming: {metrics.upcomingTours}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.revenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
          <TabsTrigger value="actions">Quick Actions</TabsTrigger>
          <TabsTrigger value="stats">Key Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bookings">
          <Card>
            <CardHeader className="flex flex-row items-center">
              <CardTitle>Recent Bookings</CardTitle>
              <Clock className="ml-2 h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="bg-[#1a5d1a]/10 p-2 rounded-full">
                        <Calendar className="h-5 w-5 text-[#1a5d1a]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{booking.tourName}</span>
                        <span className="text-xs text-muted-foreground">{booking.customerName}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">${booking.amount.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded-full">{new Date(booking.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Link href="/admin/bookings">
                  <Button variant="outline" size="sm">
                    View All Bookings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/admin/tours/new">
                  <div className="flex flex-col items-center justify-center p-4 rounded-lg border hover:bg-[#1a5d1a]/10 transition-colors h-32">
                    <Plus className="mb-2 h-8 w-8 text-[#1a5d1a]" />
                    <span className="text-center">Add New Tour</span>
                  </div>
                </Link>
                <Link href="/admin/users">
                  <div className="flex flex-col items-center justify-center p-4 rounded-lg border hover:bg-[#1a5d1a]/10 transition-colors h-32">
                    <Users className="mb-2 h-8 w-8 text-[#1a5d1a]" />
                    <span className="text-center">Manage Users</span>
                  </div>
                </Link>
                <Link href="/admin/bookings">
                  <div className="flex flex-col items-center justify-center p-4 rounded-lg border hover:bg-[#1a5d1a]/10 transition-colors h-32">
                    <Calendar className="mb-2 h-8 w-8 text-[#1a5d1a]" />
                    <span className="text-center">View Bookings</span>
                  </div>
                </Link>
                <Link href="/admin/blog">
                  <div className="flex flex-col items-center justify-center p-4 rounded-lg border hover:bg-[#1a5d1a]/10 transition-colors h-32">
                    <BookOpen className="mb-2 h-8 w-8 text-[#1a5d1a]" />
                    <span className="text-center">Manage Blog</span>
                  </div>
                </Link>

              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Key Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Tour Growth</p>
                      <p className="text-2xl font-bold">+25%</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">User Growth</p>
                      <p className="text-2xl font-bold">+30%</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue Growth</p>
                      <p className="text-2xl font-bold">+15%</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Booking Rate</p>
                      <p className="text-2xl font-bold">85%</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
