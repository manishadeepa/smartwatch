'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { AppLayout } from '../app-layout';
import { AlertHistoryTable } from '@/components/AlertHistoryTable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AlertHistoryPage() {
  const router = useRouter();

  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const alertHistory = useStore((state) => state.alertHistory);
  const addAlertToHistory = useStore((state) => state.addAlertToHistory);

  const [hydrated, setHydrated] = useState(false);

  // ✅ hydration fix (prevents old persisted flash)
  useEffect(() => {
    setHydrated(true);
  }, []);

  // 🔐 auth
  useEffect(() => {
    if (!isLoggedIn) router.push('/login');
  }, [isLoggedIn, router]);

  // 🌐 expose for console testing
  useEffect(() => {
    // @ts-ignore
    window.supabase = supabase;
  }, []);

  // 🧹 CLEAR OLD LOCAL DATA ON FIRST LOAD
  useEffect(() => {
    localStorage.removeItem('caretaker-dashboard-store');
  }, []);

  // ✅ LOAD EXISTING DATA FROM SUPABASE
  useEffect(() => {
    const loadInitialData = async () => {
      const { data, error } = await supabase
        .from('patient_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Fetch error:', error);
        return;
      }

      data?.forEach((item) => {
        addAlertToHistory({
          id: item.id.toString(),
          date: new Date(item.created_at).toLocaleDateString(),
          time: new Date(item.created_at).toLocaleTimeString(),
          location: `${item.latitude}, ${item.longitude}`,
          heartRate: item.heart_rate,
          spo2: item.spo2,
          responseStatus: 'pending',
        });
      });
    };

    loadInitialData();
  }, [addAlertToHistory]);

  // ⚡ REALTIME
  useEffect(() => {
    const channel = supabase
      .channel('realtime-history')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'patient_data' },
        (payload) => {
          const item = payload.new;

          addAlertToHistory({
            id: item.id.toString(),
            date: new Date(item.created_at).toLocaleDateString(),
            time: new Date(item.created_at).toLocaleTimeString(),
            location: `${item.latitude}, ${item.longitude}`,
            heartRate: item.heart_rate,
            spo2: item.spo2,
            responseStatus: 'pending',
          });

          if (item.fall_detected) {
            alert('🚨 FALL DETECTED!');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addAlertToHistory]);

  if (!hydrated || !isLoggedIn) return null;

  // 📊 STATS
  const stats = {
    totalAlerts: alertHistory.length,
    acceptedAlerts: alertHistory.filter((a) => a.responseStatus === 'accepted').length,
    declinedAlerts: alertHistory.filter((a) => a.responseStatus === 'declined').length,
    avgHeartRate:
      alertHistory.length > 0
        ? Math.round(
            alertHistory.reduce((sum, a) => sum + a.heartRate, 0) /
              alertHistory.length
          )
        : 0,
  };

  // 📤 EXPORT CSV
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

  // 🧹 CLEAR HISTORY
  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all alert history?')) {
      localStorage.removeItem('caretaker-dashboard-store');
      window.location.reload();
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">

        <div>
          <h1 className="text-3xl font-bold">Alert History</h1>
          <p className="text-muted-foreground">
            View and manage past fall detection alerts
          </p>
        </div>

        {/* STATS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4"><p>Total Alerts</p><h2>{stats.totalAlerts}</h2></Card>
          <Card className="p-4"><p>Accepted</p><h2>{stats.acceptedAlerts}</h2></Card>
          <Card className="p-4"><p>Declined</p><h2>{stats.declinedAlerts}</h2></Card>
          <Card className="p-4"><p>Avg Heart Rate</p><h2>{stats.avgHeartRate} BPM</h2></Card>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2">
          <Button onClick={handleExport} size="sm">
            <Download size={16} /> Export CSV
          </Button>

          <Button onClick={handleClearHistory} size="sm" variant="outline">
            <Trash2 size={16} /> Clear History
          </Button>
        </div>

        {/* TABLE */}
        <Card className="p-6">
          <AlertHistoryTable data={alertHistory} />
        </Card>
      </div>
    </AppLayout>
  );
}