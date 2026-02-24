'use client';

import { AlertCircle, Zap, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusCardProps {
  label: string;
  value: string | number;
  unit?: string;
  status?: 'safe' | 'warning' | 'emergency';
  icon?: React.ReactNode;
  className?: string;
}

export function StatusCard({
  label,
  value,
  unit,
  status = 'safe',
  icon,
  className,
}: StatusCardProps) {
  const statusColor = {
    safe: 'border-safe/30 bg-safe/5',
    warning: 'border-warning/30 bg-warning/5',
    emergency: 'border-emergency/30 bg-emergency/5',
  };

  const statusTextColor = {
    safe: 'text-safe',
    warning: 'text-warning',
    emergency: 'text-emergency',
  };

  const statusBadgeColor = {
    safe: 'bg-safe/10 text-safe',
    warning: 'bg-warning/10 text-warning',
    emergency: 'bg-emergency/10 text-emergency',
  };

  return (
    <div
      className={cn(
        'rounded-lg border-2 p-4 backdrop-blur-sm transition-all',
        statusColor[status],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className={cn('mt-2 text-3xl font-bold', statusTextColor[status])}>
            {value}
            {unit && <span className="text-lg">{unit}</span>}
          </p>
        </div>
        <div className={cn('rounded-lg p-3', statusBadgeColor[status])}>{icon}</div>
      </div>
    </div>
  );
}
