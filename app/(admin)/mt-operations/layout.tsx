import { redirect } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (process.env.ADMIN_ENABLED !== 'true') {
    redirect('/404');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gray-800 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Mystic Tours Operations</h1>
          <div className="flex space-x-4">
            <a href="/mt-operations" className="hover:text-green-400">Dashboard</a>
            <a href="/mt-operations/tours" className="hover:text-green-400">Tours</a>
            <a href="/mt-operations/bookings" className="hover:text-green-400">Bookings</a>
            <form action="/api/admin/auth" method="DELETE" className="inline">
              <button className="bg-red-600 px-4 py-2 rounded hover:bg-red-700">
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="p-6">
        {children}
      </main>
    </div>
  );
} 