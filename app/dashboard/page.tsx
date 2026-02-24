'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { AppLayout } from '../app-layout';
import { StatusCard } from '@/components/StatusCard';
import { AlertModal } from '@/components/AlertModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Heart,
  Activity,
  AlertCircle,
  Battery,
  Clock,
  TrendingUp,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const {
    isLoggedIn,
    patient,
    currentAlert,
    setCurrentAlert,
    triggerFallAlert,
    resetSystem,
  } = useStore();

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [lastActionTime, setLastActionTime] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (currentAlert) {
      setIsAlertModalOpen(true);
    }
  }, [currentAlert]);

  if (!isLoggedIn) {
    return null;
  }

  const getPatientStatus = () => {
    if (currentAlert) {
      return { label: 'FALL DETECTED', status: 'emergency' as const };
    }
    const isInactive = Date.now() - new Date(patient.lastSyncTime).getTime() > 300000; // 5 mins
    if (isInactive) {
      return { label: 'INACTIVE', status: 'warning' as const };
    }
    return { label: 'SAFE', status: 'safe' as const };
  };

  const patientStatusInfo = getPatientStatus();

  const handleTriggerAlert = () => {
    triggerFallAlert();
    setLastActionTime(new Date().toLocaleTimeString());
    toast.error('Fall alert simulated - Check the emergency modal');
  };

  const handleResetSystem = () => {
    resetSystem();
    setIsAlertModalOpen(false);
    setCurrentAlert(null);
    setLastActionTime(new Date().toLocaleTimeString());
    toast.success('System reset to SAFE status');
  };

  const handleCloseAlert = () => {
    setIsAlertModalOpen(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Monitor patient status and manage alerts</p>
        </div>

        {/* Hero Status Card */}
        <Card className="overflow-hidden border-border bg-gradient-to-br from-card to-card/50 p-6 sm:p-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Patient Status</p>
              <h2 className="text-4xl font-bold text-foreground">{patient.name}</h2>
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    patientStatusInfo.status === 'emergency'
                      ? 'bg-emergency'
                      : patientStatusInfo.status === 'warning'
                        ? 'bg-warning'
                        : 'bg-safe'
                  } animate-pulse`}
                />
                <p className="font-semibold text-muted-foreground">{patientStatusInfo.label}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleTriggerAlert}
                className="gap-2 bg-emergency hover:bg-emergency/90 text-white"
              >
                <AlertCircle size={20} />
                <span className="hidden sm:inline">Trigger Fall Alert</span>
                <span className="sm:hidden">Alert</span>
              </Button>
              <Button
                onClick={handleResetSystem}
                variant="outline"
                className="gap-2"
              >
                <Zap size={20} />
                <span className="hidden sm:inline">Reset System</span>
                <span className="sm:hidden">Reset</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatusCard
            label="Heart Rate"
            value={Math.round(patient.currentHeartRate)}
            unit="BPM"
            status={patient.currentHeartRate > 100 ? 'warning' : 'safe'}
            icon={<Heart size={24} />}
          />
          <StatusCard
            label="SpO₂ Level"
            value={Math.round(patient.currentSpo2)}
            unit="%"
            status={patient.currentSpo2 < 94 ? 'warning' : 'safe'}
            icon={<Activity size={24} />}
          />
          <StatusCard
            label="Battery Level"
            value={patient.wearableBattery}
            unit="%"
            status={patient.wearableBattery < 20 ? 'warning' : 'safe'}
            icon={<Battery size={24} />}
          />
          <StatusCard
            label="Last Sync"
            value={patient.lastSyncTime}
            status="safe"
            icon={<Clock size={24} />}
          />
        </div>

        {/* Patient Info Cards */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Patient Details */}
          <Card className="border-border p-6">
            <h3 className="mb-4 font-semibold text-foreground">Patient Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Age:</span>
                <span className="font-medium">{patient.age} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Device ID:</span>
                <span className="font-mono text-xs font-medium">{patient.deviceId}</span>
              </div>
              <div className="space-y-2">
                <span className="text-muted-foreground">Medical Notes:</span>
                <p className="rounded-lg bg-muted/50 p-2 text-xs leading-relaxed">
                  {patient.medicalNotes}
                </p>
              </div>
            </div>
            <Link href="/patient-profile" className="mt-4 block">
              <Button variant="outline" className="w-full" size="sm">
                View Full Profile
              </Button>
            </Link>
          </Card>

          {/* Quick Actions */}
          <Card className="border-border p-6">
            <h3 className="mb-4 font-semibold text-foreground">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/alert-history" className="block">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <TrendingUp size={16} className="mr-2" />
                  View Alert History
                </Button>
              </Link>
              <Link href="/patient-profile" className="block">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Activity size={16} className="mr-2" />
                  View Health Details
                </Button>
              </Link>
              <Link href="/settings" className="block">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Activity size={16} className="mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
            {lastActionTime && (
              <p className="mt-4 text-xs text-muted-foreground">
                Last action: <strong>{lastActionTime}</strong>
              </p>
            )}
          </Card>
        </div>

        {/* Emergency Alert Modal */}
        <AlertModal
          alert={currentAlert}
          isOpen={isAlertModalOpen}
          onClose={handleCloseAlert}
        />
      </div>
    </AppLayout>
  );
}
