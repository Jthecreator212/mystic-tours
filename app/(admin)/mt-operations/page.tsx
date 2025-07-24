'use client';

import { useEffect, useState } from 'react';
import { StatCard } from '@/components/ui/stat-card';
import { StatusIndicator, StatusType } from '@/components/ui/status-indicator';

interface DashboardStats {
  totalTours: number;
  totalBookings: number;
  totalRevenue: number;
  totalPickups: number;
  totalImages: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStats(data);
        setError(null);
      })
      .catch(() => setError('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  // System status mock data (replace with real checks as needed)
  const systemStatus: { label: string; status: StatusType; description?: string }[] = [
    { label: 'Database', status: 'success' },
    { label: 'Telegram Bot', status: 'success' },
    { label: 'Image Storage', status: 'success' },
    { label: 'Admin Interface', status: 'success', description: 'SECURE' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold text-[#e9b824] font-playfair mb-4">Operations Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <StatCard title="Active Tours" value={stats?.totalTours ?? 0} color="text-[#1a5d1a]" loading={loading} error={error ?? undefined} />
        <StatCard title="Total Bookings" value={stats?.totalBookings ?? 0} color="text-[#e9b824]" loading={loading} error={error ?? undefined} />
        <StatCard title="Airport Pickups" value={stats?.totalPickups ?? 0} color="text-[#4e9f3d]" loading={loading} error={error ?? undefined} />
        <StatCard title="Total Images" value={stats?.totalImages ?? 0} color="text-[#85603f]" loading={loading} error={error ?? undefined} />
        <StatCard title="Total Revenue" value={`$${stats?.totalRevenue?.toLocaleString() ?? 0}`} color="text-[#d83f31]" loading={loading} error={error ?? undefined} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#f8ede3] border border-[#e9b824] rounded-lg">
          <div className="p-4 border-b border-[#e9b824]">
            <span className="text-[#1a5d1a] font-semibold text-lg">Quick Actions</span>
          </div>
          <div className="p-4 space-y-2">
            <a href="/mt-operations/tours" className="block bg-[#1a5d1a] text-[#e9b824] p-3 rounded hover:bg-[#4e9f3d] text-center font-bold transition-colors">Manage Tours</a>
            <a href="/mt-operations/bookings" className="block bg-[#e9b824] text-[#1a5d1a] p-3 rounded hover:bg-[#f8ede3] text-center font-bold transition-colors">View Bookings</a>
            <a href="/" target="_blank" className="block bg-[#85603f] text-[#f8ede3] p-3 rounded hover:bg-[#e9b824] text-center font-bold transition-colors">View Public Site</a>
          </div>
        </div>
        <div className="bg-[#f8ede3] border border-[#e9b824] rounded-lg">
          <div className="p-4 border-b border-[#e9b824]">
            <span className="text-[#1a5d1a] font-semibold text-lg">System Status</span>
          </div>
          <div className="p-4 space-y-2">
            {systemStatus.map((s) => (
              <StatusIndicator key={s.label} label={s.label} status={s.status} description={s.description} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 