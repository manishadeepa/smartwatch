'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabaseClient';
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
    setPatient,
    resetSystem,
    triggerFallAlert,
  } = useStore();

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [lastActionTime, setLastActionTime] = useState<string | null>(null);

  // expose supabase for console testing
  useEffect(() => {
    // @ts-ignore
    window.supabase = supabase;
  }, []);

  // auth check
  useEffect(() => {
    if (!isLoggedIn) router.push('/login');
  }, [isLoggedIn, router]);

  // open modal when alert arrives
  useEffect(() => {
    if (currentAlert) setIsAlertModalOpen(true);
  }, [currentAlert]);

  // ✅ LOAD LATEST ROW ON PAGE OPEN
  useEffect(() => {
    const loadLatest = async () => {
      const { data, error } = await supabase
        .from('patient_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Load latest error:', error);
        return;
      }

      if (data) {
        setPatient((prev: any) => ({
          ...prev,
          name: data.patient_name || prev.name || 'Patient',
          currentHeartRate: data.heart_rate,
          currentSpo2: data.spo2,
          wearableBattery: data.battery ?? prev.wearableBattery,
          lastSyncTime: new Date(data.created_at).toLocaleTimeString(),
        }));
      }
    };

    loadLatest();
  }, [setPatient]);

  // ✅ REALTIME LISTENER
  useEffect(() => {
    const channel = supabase
      .channel('live-dashboard')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'patient_data' },
        (payload) => {
          const data = payload.new;

          console.log('🔥 DASHBOARD REALTIME:', data);

          // ✅ update patient vitals + name
          setPatient((prev: any) => ({
            ...prev,
            name: data.patient_name || prev.name || 'Patient',
            currentHeartRate: data.heart_rate,
            currentSpo2: data.spo2,
            wearableBattery: data.battery ?? prev.wearableBattery,
            lastSyncTime: new Date().toLocaleTimeString(),
          }));

          // ✅ create fall alert
          if (data.fall_detected) {
            setCurrentAlert({
              id: data.id,
              patientName: data.patient_name || 'Patient',
              heartRate: data.heart_rate,
              spo2: data.spo2,
              latitude: data.latitude,
              longitude: data.longitude,
              timestamp: data.created_at,
              status: 'pending',
            });

            toast.error('🚨 FALL DETECTED!');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setPatient, setCurrentAlert]);

  if (!isLoggedIn) return null;

  // ✅ STATUS LOGIC
  const getPatientStatus = () => {
    if (currentAlert) {
      return { label: 'FALL DETECTED', status: 'emergency' as const };
    }

    const lastSync = new Date(patient.lastSyncTime).getTime();
    const inactive = Date.now() - lastSync > 300000;

    if (inactive) return { label: 'INACTIVE', status: 'warning' as const };

    return { label: 'SAFE', status: 'safe' as const };
  };

  const patientStatusInfo = getPatientStatus();

  // actions
  const handleTriggerAlert = () => {
    triggerFallAlert();
    setLastActionTime(new Date().toLocaleTimeString());
    toast.error('Fall alert simulated');
  };

  const handleResetSystem = () => {
    resetSystem();
    setCurrentAlert(null);
    setIsAlertModalOpen(false);
    setLastActionTime(new Date().toLocaleTimeString());
    toast.success('System reset');
  };

  const handleCloseAlert = () => setIsAlertModalOpen(false);

  return (
    <AppLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor patient status and manage alerts
          </p>
        </div>

        {/* HERO */}
        <Card className="p-6">
          <h2 className="text-4xl font-bold">
            {patient.name || 'Loading...'}
          </h2>

          <p className="mt-2">{patientStatusInfo.label}</p>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleTriggerAlert} className="bg-red-600 text-white">
              <AlertCircle size={18} /> Trigger Fall Alert
            </Button>

            <Button onClick={handleResetSystem} variant="outline">
              <Zap size={18} /> Reset
            </Button>
          </div>
        </Card>

        {/* LIVE VITALS */}
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

        {/* PATIENT INFO */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Patient Information</h3>

          <div className="flex justify-between">
            <span>Age:</span>
            <span>{patient.age} years</span>
          </div>

          <div className="flex justify-between">
            <span>Device ID:</span>
            <span>{patient.deviceId}</span>
          </div>

          <p className="mt-3">{patient.medicalNotes}</p>

          <Link href="/patient-profile">
            <Button className="w-full mt-4" variant="outline">
              View Full Profile
            </Button>
          </Link>
        </Card>

        {/* QUICK ACTIONS */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Quick Actions</h3>

          <Link href="/alert-history">
            <Button variant="outline" className="w-full mb-2">
              <TrendingUp size={16} /> View Alert History
            </Button>
          </Link>

          <Link href="/patient-profile">
            <Button variant="outline" className="w-full mb-2">
              <Activity size={16} /> View Health Details
            </Button>
          </Link>

          <Link href="/settings">
            <Button variant="outline" className="w-full">
              Settings
            </Button>
          </Link>

          {lastActionTime && (
            <p className="text-xs mt-3">Last action: {lastActionTime}</p>
          )}
        </Card>

        <AlertModal
          alert={currentAlert}
          isOpen={isAlertModalOpen}
          onClose={handleCloseAlert}
        />
      </div>
    </AppLayout>
  );
}