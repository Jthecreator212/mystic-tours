"use client";
import { useState } from 'react';
import { Menu, X, LayoutDashboard, Map, CalendarCheck2, Image as ImageIcon, Users, DollarSign, Settings, Calendar } from 'lucide-react';
import Link from 'next/link';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/mt-operations', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Tours', href: '/mt-operations/tours', icon: <Map className="w-5 h-5" /> },
  { label: 'Bookings', href: '/mt-operations/bookings', icon: <CalendarCheck2 className="w-5 h-5" /> },
  { label: 'Images', href: '/mt-operations/images', icon: <ImageIcon className="w-5 h-5" /> },
  { label: 'Customers', href: '/mt-operations/customers', icon: <Users className="w-5 h-5" /> },
  { label: 'Drivers', href: '/mt-operations/drivers', icon: <Users className="w-5 h-5" /> },
  { label: 'Assignments Calendar', href: '/mt-operations/assignments-calendar', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Finances', href: '/mt-operations/finances', icon: <DollarSign className="w-5 h-5" /> },
  { label: 'Settings', href: '/mt-operations/settings', icon: <Settings className="w-5 h-5" /> },
];

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        className="fixed top-4 left-4 z-40 md:hidden p-2 rounded bg-[#1a5d1a] text-[#e9b824] focus:outline-none focus:ring-2 focus:ring-[#e9b824]"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu className="w-6 h-6" />
      </button>
      {/* Overlay for mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
      {/* Sidebar */}
      <aside
        className={`fixed z-40 top-0 left-0 h-screen w-64 bg-[#1a5d1a] text-[#e9b824] shadow-lg transform transition-transform duration-200 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:shadow-none md:block`}
        aria-label="Admin sidebar navigation"
      >
        {/* Close button for mobile */}
        <div className="flex items-center justify-between p-4 border-b border-[#e9b824] md:hidden">
          <span className="text-lg font-bold font-playfair tracking-wide">Mystic Tours Ops</span>
          <button onClick={() => setOpen(false)} aria-label="Close sidebar">
            <X className="w-6 h-6" />
          </button>
        </div>
        {/* Logo/Title for desktop */}
        <div className="hidden md:flex items-center justify-center p-6 border-b border-[#e9b824]">
          <span className="text-xl font-bold font-playfair tracking-wide">Mystic Tours Ops</span>
        </div>
        <nav className="flex flex-col gap-2 p-4 md:p-6" role="navigation" aria-label="Sidebar links">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg font-semibold uppercase tracking-wide hover:bg-[#e9b824]/10 focus:bg-[#e9b824]/20 focus:outline-none transition-colors"
              tabIndex={0}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
} 