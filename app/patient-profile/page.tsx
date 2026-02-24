'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { AppLayout } from '../app-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Phone, Mail, MapPin, Calendar, AlertCircle, FileText } from 'lucide-react';
import { useEffect } from 'react';

export default function PatientProfilePage() {
  const router = useRouter();
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const patient = useStore((state) => state.patient);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Patient Profile</h1>
          <p className="text-muted-foreground">Detailed health information and medical records</p>
        </div>

        {/* Patient Hero Card */}
        <Card className="border-border bg-gradient-to-br from-card to-card/50 p-6 sm:p-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                <svg
                  className="h-10 w-10 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{patient.name}</h2>
                <p className="text-muted-foreground">{patient.age} years old</p>
                <Badge className="mt-2 bg-safe/10 text-safe">Active Patient</Badge>
              </div>
            </div>
            <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
          </div>
        </Card>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Vital Information */}
          <Card className="border-border p-6 lg:col-span-2">
            <h3 className="mb-4 text-xl font-semibold text-foreground">Current Vitals</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Heart size={18} className="text-emergency" />
                  <span className="text-sm font-medium">Heart Rate</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {Math.round(patient.currentHeartRate)} BPM
                </p>
                <p className="text-xs text-muted-foreground">Normal Range: 60-100 BPM</p>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Activity size={18} className="text-warning" />
                  <span className="text-sm font-medium">SpO₂ Level</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {Math.round(patient.currentSpo2)}%
                </p>
                <p className="text-xs text-muted-foreground">Normal Range: 95-100%</p>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={18} className="text-primary" />
                  <span className="text-sm font-medium">Last Sync</span>
                </div>
                <p className="mt-2 text-lg font-bold text-foreground">{patient.lastSyncTime}</p>
                <p className="text-xs text-muted-foreground">Real-time sync enabled</p>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Battery size={18} className="text-safe" />
                  <span className="text-sm font-medium">Device Battery</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">{patient.wearableBattery}%</p>
                <p className="text-xs text-muted-foreground">Wearable charge level</p>
              </div>
            </div>
          </Card>

          {/* Device Information */}
          <Card className="border-border p-6">
            <h3 className="mb-4 font-semibold text-foreground">Device Information</h3>
            <div className="space-y-4 text-sm">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs font-medium text-muted-foreground">Device ID</p>
                <p className="mt-1 font-mono break-all">{patient.deviceId}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs font-medium text-muted-foreground">Status</p>
                <p className="mt-1 flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-safe" />
                  <span>Connected</span>
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs font-medium text-muted-foreground">Last Activity</p>
                <p className="mt-1">{patient.lastSyncTime}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Medical Information */}
        <Card className="border-border p-6">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
            <FileText size={20} />
            Medical Information
          </h3>
          <div className="rounded-lg bg-muted/50 p-6">
            <p className="leading-relaxed text-muted-foreground">{patient.medicalNotes}</p>
          </div>
        </Card>

        {/* Emergency Contacts */}
        <Card className="border-border p-6">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
            <AlertCircle size={20} className="text-emergency" />
            Emergency Contacts
          </h3>
          <div className="space-y-3">
            {patient.emergencyContacts.map((contact, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-card/50 p-4"
              >
                <div>
                  <p className="font-medium text-foreground">{contact.split(':')[0]}</p>
                  <p className="text-sm text-muted-foreground">{contact.split(':')[1]}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Phone size={16} className="mr-2" />
                  Call
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

// Activity icon component (since it may not be in lucide-react)
function Activity({ size, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );
}

// Battery icon component
function Battery({ size, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect>
      <line x1="23" y1="8" x2="23" y2="16"></line>
    </svg>
  );
}
