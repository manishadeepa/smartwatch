'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertHistory } from '@/lib/store';

interface AlertHistoryTableProps {
  data: AlertHistory[];
}

export function AlertHistoryTable({ data }: AlertHistoryTableProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-warning/10 text-warning', label: 'Pending' },
      accepted: { color: 'bg-safe/10 text-safe', label: 'Accepted' },
      declined: { color: 'bg-emergency/10 text-emergency', label: 'Declined' },
      resolved: { color: 'bg-primary/10 text-primary', label: 'Resolved' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  if (data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-border bg-card/50">
        <p className="text-sm text-muted-foreground">No alert history available</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Heart Rate</TableHead>
              <TableHead className="text-right">SpO₂</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id} className="border-border">
                <TableCell className="font-medium text-sm">{item.date}</TableCell>
                <TableCell className="text-sm">{item.time}</TableCell>
                <TableCell className="text-sm font-mono text-xs text-muted-foreground">
                  {item.location}
                </TableCell>
                <TableCell className="text-right text-sm font-medium">{item.heartRate} BPM</TableCell>
                <TableCell className="text-right text-sm font-medium">{item.spo2}%</TableCell>
                <TableCell>{getStatusBadge(item.responseStatus)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
