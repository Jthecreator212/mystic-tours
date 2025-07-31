"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load the calendar component
const AssignmentsCalendar = dynamic(
  () => import('./assignments-calendar'),
  {
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#388e3c] mx-auto mb-4"></div>
          <p className="text-[#388e3c]">Loading calendar...</p>
        </div>
      </div>
    ),
    ssr: false // Disable SSR for calendar component
  }
);

export default function LazyCalendar() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#388e3c] mx-auto mb-4"></div>
          <p className="text-[#388e3c]">Loading calendar...</p>
        </div>
      </div>
    }>
      <AssignmentsCalendar />
    </Suspense>
  );
} 