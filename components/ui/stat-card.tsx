import React from 'react';

export interface StatCardProps {
  title: string;
  value: React.ReactNode;
  color?: string; // Tailwind text color class
  loading?: boolean;
  error?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, color = 'text-[#1a5d1a]', loading, error }) => {
  return (
    <div className="bg-[#f8ede3] border border-[#e9b824] rounded-lg p-4 min-h-[110px] flex flex-col justify-between">
      <div className="text-sm font-medium text-[#1a5d1a]">{title}</div>
      <div className={`text-3xl font-bold mt-2 ${color}`}>
        {loading ? <span className="animate-pulse">...</span> : error ? <span className="text-red-600">{error}</span> : value}
      </div>
    </div>
  );
}; 