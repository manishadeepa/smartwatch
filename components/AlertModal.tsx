'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Heart, Activity, Clock } from 'lucide-react';
import { EmergencyButtons } from './EmergencyButtons';
import { MapView } from './MapView';
import { useStore, type Alert } from '@/lib/store';
import { toast } from 'sonner';

interface AlertModalProps {
  alert: Alert | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AlertModal({ alert, isOpen, onClose }: AlertModalProps) {
  const { updateAlertStatus, addAlertToHistory } = useStore();
  const [isAnimating, setIsAnimating] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);

  useEffect(() => {
    if (isOpen && alert) {
      setIsAnimating(true);
      // Trigger alert sound
      playAlertSound();
    }
  }, [isOpen, alert]);

  useEffect(() => {
    if (!isAnimating) return;
    const interval = setInterval(() => {
      setPulseCount((prev) => prev + 1);
    }, 500);
    return () => clearInterval(interval);
  }, [isAnimating]);

  if (!isOpen || !alert) return null;

  const handleAccept = () => {
    updateAlertStatus(alert.id, 'accepted', 'RESPONDED');
    addAlertToHistory(alert);
    setIsAnimating(false);
    setTimeout(() => onClose(), 1000);
  };

  const handleDecline = () => {
    updateAlertStatus(alert.id, 'declined', 'ESCALATED');
    addAlertToHistory(alert);
    setIsAnimating(false);
    toast.error('Alert escalated to emergency services');
    setTimeout(() => onClose(), 1000);
  };

  const handleCallPatient = () => {
    toast.info('Calling patient...');
  };

  const handleCallAmbulance = () => {
    updateAlertStatus(alert.id, 'declined', 'AMBULANCE_CALLED');
    addAlertToHistory(alert);
    toast.error('Ambulance has been dispatched');
  };

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isOpen ? 'bg-black/50 backdrop-blur-sm opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 transform rounded-2xl border border-emergency/30 bg-background shadow-2xl transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        {/* Animated border flash */}
        <div
          className={`absolute inset-0 rounded-2xl border-2 ${
            pulseCount % 2 === 0 ? 'border-emergency' : 'border-emergency/30'
          } transition-colors duration-300`}
        />

        <div className="relative p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <AlertCircle
                  size={40}
                  className={`text-emergency ${
                    isAnimating ? 'animate-pulse' : ''
                  }`}
                />
                <div className="absolute inset-0 animate-ping rounded-full border border-emergency/50" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emergency">FALL DETECTED</h2>
                <p className="text-sm text-muted-foreground">Immediate response required</p>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="mb-6 rounded-lg border border-border bg-card/50 p-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Patient Name</p>
                <p className="mt-1 font-semibold">{alert.patientName}</p>
              </div>
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Heart size={16} className="text-emergency" />
                  Heart Rate
                </p>
                <p className="mt-1 font-semibold">{Math.round(alert.heartRate)} BPM</p>
              </div>
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Activity size={16} className="text-warning" />
                  SpO₂
                </p>
                <p className="mt-1 font-semibold">{Math.round(alert.spo2)}%</p>
              </div>
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Clock size={16} className="text-primary" />
                  Time
                </p>
                <p className="mt-1 font-semibold">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="mb-6">
            <h3 className="mb-3 font-semibold">Live Location</h3>
            <MapView latitude={alert.latitude} longitude={alert.longitude} />
          </div>

          {/* Emergency Buttons */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Choose your response:</p>
            <EmergencyButtons
              onAccept={handleAccept}
              onDecline={handleDecline}
              onCallPatient={handleCallPatient}
              onCallAmbulance={handleCallAmbulance}
            />
          </div>

          {/* Quick Info */}
          <div className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <p>
              Alert triggered at{' '}
              <strong>{new Date(alert.timestamp).toLocaleString()}</strong>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function playAlertSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create three beeps
    const beep = (time: number, duration: number, frequency: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(0.3, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + duration);
      
      oscillator.start(time);
      oscillator.stop(time + duration);
    };

    const now = audioContext.currentTime;
    beep(now, 0.3, 800);
    beep(now + 0.4, 0.3, 1000);
    beep(now + 0.8, 0.3, 800);
  } catch (error) {
    console.error('Audio playback error:', error);
  }
}
