'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { AppLayout } from '../app-layout';
import { AlertHistoryTable } from '@/components/AlertHistoryTable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, TrendingUp, Calendar, Download, Trash2 } from 'lucide-react';
import { useEffect } from 'react';

export default function AlertHistoryPage() {
  const router = useRouter();
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const alertHistory = useStore((state) => state.alertHistory);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return null;
  }

  const stats = {
    totalAlerts: alertHistory.length,
    acceptedAlerts: alertHistory.filter((a) => a.responseStatus === 'accepted').length,
    declinedAlerts: alertHistory.filter((a) => a.responseStatus === 'declined').length,
    avgHeartRate:
      alertHistory.length > 0
        ? Math.round(alertHistory.reduce((sum, a) => sum + a.heartRate, 0) / alertHistory.length)
        : 0,
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'Time', 'Location', 'Heart Rate', 'SpO2', 'Status'],
      ...alertHistory.map((item) => [
        item.date,
        item.time,
        item.location,
        item.heartRate,
        item.spo2,
        item.responseStatus,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alert-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all alert history? This cannot be undone.')) {
      // In a real app, this would clear the history
      window.location.reload();
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Alert History</h1>
          <p className="text-muted-foreground">View and manage past fall detection alerts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Alerts</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalAlerts}</p>
              </div>
              <BarChart size={28} className="text-primary opacity-20" />
            </div>
          </Card>

          <Card className="border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                <p className="mt-2 text-2xl font-bold text-safe">{stats.acceptedAlerts}</p>
              </div>
              <TrendingUp size={28} className="text-safe opacity-20" />
            </div>
          </Card>

          <Card className="border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Declined</p>
                <p className="mt-2 text-2xl font-bold text-warning">{stats.declinedAlerts}</p>
              </div>
              <Calendar size={28} className="text-warning opacity-20" />
            </div>
          </Card>

          <Card className="border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Heart Rate</p>
                <p className="mt-2 text-2xl font-bold text-emergency">{stats.avgHeartRate} BPM</p>
              </div>
              <BarChart size={28} className="text-emergency opacity-20" />
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={handleExport} variant="outline" className="gap-2" size="sm">
            <Download size={16} />
            Export as CSV
          </Button>
          <Button
            onClick={handleClearHistory}
            variant="outline"
            className="gap-2 text-emergency hover:text-emergency"
            size="sm"
          >
            <Trash2 size={16} />
            Clear History
          </Button>
        </div>

        {/* Alert History Table */}
        <Card className="border-border overflow-hidden">
          <div className="p-6">
            <h3 className="mb-4 font-semibold text-foreground">Recent Alerts</h3>
            <AlertHistoryTable data={alertHistory} />
          </div>
        </Card>

        {/* Information Card */}
        <Card className="border-border bg-muted/30 p-6">
          <h3 className="mb-3 font-semibold text-foreground">About Alert History</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This page displays all fall detection alerts that have been triggered for this patient.
            Each alert includes vital information at the time of detection (heart rate, SpO₂ levels),
            location coordinates, and the response status. You can export this data for medical
            records or further analysis. Data is automatically persisted to your local storage.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
