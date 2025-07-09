import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

async function getDashboardStats() {
  const [toursResult, bookingsResult, pickupsResult] = await Promise.all([
    supabase.from('tours').select('id'),
    supabase.from('bookings').select('id, total_amount').eq('status', 'confirmed'),
    supabase.from('airport_pickup_bookings').select('id, total_price')
  ]);

  return {
    totalTours: toursResult.data?.length || 0,
    totalBookings: bookingsResult.data?.length || 0,
    totalRevenue: (bookingsResult.data?.reduce((sum, b) => sum + Number(b.total_amount), 0) || 0) +
                  (pickupsResult.data?.reduce((sum, p) => sum + Number(p.total_price), 0) || 0),
    totalPickups: pickupsResult.data?.length || 0
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Operations Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Active Tours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalTours}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalBookings}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Airport Pickups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalPickups}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">${stats.totalRevenue}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/mt-operations/tours" className="block bg-green-600 text-white p-3 rounded hover:bg-green-700 text-center">
              Manage Tours
            </a>
            <a href="/mt-operations/bookings" className="block bg-blue-600 text-white p-3 rounded hover:bg-blue-700 text-center">
              View Bookings
            </a>
            <a href="/" target="_blank" className="block bg-purple-600 text-white p-3 rounded hover:bg-purple-700 text-center">
              View Public Site
            </a>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Database</span>
                <span className="text-green-600 font-bold">●</span>
              </div>
              <div className="flex justify-between">
                <span>Telegram Bot</span>
                <span className="text-green-600 font-bold">●</span>
              </div>
              <div className="flex justify-between">
                <span>Image Storage</span>
                <span className="text-green-600 font-bold">●</span>
              </div>
              <div className="flex justify-between">
                <span>Admin Interface</span>
                <span className="text-green-600 font-bold">● SECURE</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 