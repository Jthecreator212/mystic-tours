import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/admin-navbar';
import AdminBreadcrumb from '@/components/ui/admin-breadcrumb';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (process.env.ADMIN_ENABLED !== 'true') {
    redirect('/404');
  }

  return (
    <div className="min-h-screen bg-[#f8ede3] flex">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-6 text-[#85603f] transition-all duration-200 overflow-y-auto h-screen">
        <AdminBreadcrumb />
        {children}
      </main>
    </div>
  );
} 