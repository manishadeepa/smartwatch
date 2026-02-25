import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Alert {
  id: string;
  patientName: string;
  heartRate: number;
  spo2: number;
  timestamp: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'accepted' | 'declined' | 'resolved';
  responseAction?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  medicalNotes: string;
  emergencyContacts: string[];
  deviceId: string;
  currentHeartRate: number;
  currentSpo2: number;
  lastSyncTime: string;
  wearableBattery: number;
}

export interface AlertHistory {
  id: string;
  date: string;
  time: string;
  location: string;
  heartRate: number;
  spo2: number;
  responseStatus: string;
}

interface Store {
  // Auth
  isLoggedIn: boolean;
  userRole: 'caretaker' | 'admin';
  login: (email: string, password: string) => void;
  logout: () => void;

  // Current Alert
  currentAlert: Alert | null;
  setCurrentAlert: (alert: Alert | null) => void;
  updateAlertStatus: (alertId: string, status: Alert['status'], action?: string) => void;

  // Patient
  patient: Patient;
  setPatient: (patient: Patient) => void;

  // Alert History
  alertHistory: AlertHistory[];
  addAlertToHistory: (alert: Alert) => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Demo
  triggerFallAlert: () => void;
  resetSystem: () => void;
}

const defaultPatient: Patient = {
  id: 'PAT001',
  name: 'John Doe',
  age: 75,
  medicalNotes: 'Hypertension, Diabetes Type 2, Previous fall history',
  emergencyContacts: ['Jane Doe (Daughter): +1-555-0101', 'Dr. Smith: +1-555-0102'],
  deviceId: 'WearableDevice-7584',
  currentHeartRate: 72,
  currentSpo2: 98,
  lastSyncTime: new Date().toLocaleTimeString(),
  wearableBattery: 87,
};

export const useStore = create<Store>()(
  persist(
    (set) => ({
      // Auth
      isLoggedIn: false,
      userRole: 'caretaker',
      login: (email: string, password: string) => {
        if (email && password) {
          set({ isLoggedIn: true });
        }
      },
      logout: () => set({ isLoggedIn: false }),

      // Current Alert
      currentAlert: null,
      setCurrentAlert: (alert) => set({ currentAlert: alert }),
      updateAlertStatus: (alertId, status, action) =>
        set((state) => ({
          currentAlert:
            state.currentAlert && state.currentAlert.id === alertId
              ? { ...state.currentAlert, status, responseAction: action }
              : state.currentAlert,
        })),

      // Patient
      // Patient
patient: defaultPatient,
setPatient: (patient) =>
  set((state) => ({
    patient:
      typeof patient === 'function'
        ? patient(state.patient)
        : patient,
  })),

      // Alert History
      alertHistory: [],
      addAlertToHistory: (alert) =>
        set((state) => ({
          alertHistory: [
            {
              id: alert.id,
              date: new Date(alert.timestamp).toLocaleDateString(),
              time: new Date(alert.timestamp).toLocaleTimeString(),
              location: `${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}`,
              heartRate: alert.heartRate,
              spo2: alert.spo2,
              responseStatus: alert.status,
            },
            ...state.alertHistory,
          ],
        })),

      // Theme
      isDarkMode: false,
      toggleDarkMode: () =>
        set((state) => {
          const newDarkMode = !state.isDarkMode;
          if (newDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { isDarkMode: newDarkMode };
        }),

      // Demo
      triggerFallAlert: () => {
        const alert: Alert = {
          id: `ALERT-${Date.now()}`,
          patientName: defaultPatient.name,
          heartRate: 92 + Math.random() * 20,
          spo2: 95 + Math.random() * 4,
          timestamp: new Date().toISOString(),
          latitude: 40.7128 + (Math.random() - 0.5) * 0.01,
          longitude: -74.006 + (Math.random() - 0.5) * 0.01,
          status: 'pending',
        };
        set((state) => ({
          currentAlert: alert,
          patient: {
            ...state.patient,
            currentHeartRate: Math.round(alert.heartRate),
            currentSpo2: Math.round(alert.spo2),
            lastSyncTime: new Date().toLocaleTimeString(),
          },
        }));
        // Play alert sound
        playAlertSound();
      },
      resetSystem: () =>
        set({
          currentAlert: null,
          patient: {
            ...defaultPatient,
            currentHeartRate: 72,
            currentSpo2: 98,
            lastSyncTime: new Date().toLocaleTimeString(),
            wearableBattery: 87,
          },
        }),
    }),
    {
      name: 'caretaker-dashboard-store',
    }
  )
);

function playAlertSound() {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800;
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}
