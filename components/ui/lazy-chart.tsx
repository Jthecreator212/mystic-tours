"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load the chart component
const Chart = dynamic(
  () => import('./chart'),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#388e3c] mx-auto mb-2"></div>
          <p className="text-sm text-[#388e3c]">Loading chart...</p>
        </div>
      </div>
    ),
    ssr: false // Disable SSR for chart component
  }
);

interface LazyChartProps {
  data: any[];
  type?: string;
  height?: number;
  width?: number;
}

export default function LazyChart({ data, type = "line", height = 300, width = 600 }: LazyChartProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#388e3c] mx-auto mb-2"></div>
          <p className="text-sm text-[#388e3c]">Loading chart...</p>
        </div>
      </div>
    }>
      <Chart data={data} type={type} height={height} width={width} />
    </Suspense>
  );
} 