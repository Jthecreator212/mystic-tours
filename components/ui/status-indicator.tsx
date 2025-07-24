import React from 'react';

export type StatusType = 'success' | 'warning' | 'error';

export interface StatusIndicatorProps {
  label: string;
  status: StatusType;
  description?: string;
}

const statusColor: Record<StatusType, string> = {
  success: 'text-green-600',
  warning: 'text-yellow-500',
  error: 'text-red-600',
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ label, status, description }) => (
  <div className="flex items-center justify-between">
    <span>{label}</span>
    <span className={`font-bold flex items-center gap-1 ${statusColor[status]}`}>
      <span className="text-xl">●</span>
      {description && <span className="text-xs font-semibold">{description}</span>}
    </span>
  </div>
); 