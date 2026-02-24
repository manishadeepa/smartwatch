'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { AppLayout } from '../app-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun, Bell, Lock, Database, LogOut } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const router = useRouter();
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const isDarkMode = useStore((state) => state.isDarkMode);
  const toggleDarkMode = useStore((state) => state.toggleDarkMode);
  const logout = useStore((state) => state.logout);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return null;
  }

  const handleThemeToggle = () => {
    toggleDarkMode();
    toast.success(isDarkMode ? 'Light mode enabled' : 'Dark mode enabled');
  };

  const handleNotificationToggle = () => {
    toast.success('Notification settings updated');
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
    toast.success('Logged out successfully');
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all stored data? This cannot be undone.')) {
      localStorage.clear();
      toast.success('All data cleared successfully');
      window.location.reload();
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences and system settings</p>
        </div>

        {/* Display Settings */}
        <Card className="border-border p-6">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Sun size={20} />
            Display Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                {isDarkMode ? (
                  <Moon size={20} className="text-primary" />
                ) : (
                  <Sun size={20} className="text-warning" />
                )}
                <div>
                  <p className="font-medium text-foreground">Theme</p>
                  <p className="text-sm text-muted-foreground">
                    Currently: {isDarkMode ? 'Dark' : 'Light'} Mode
                  </p>
                </div>
              </div>
              <Switch
                checked={isDarkMode}
                onCheckedChange={handleThemeToggle}
              />
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="border-border p-6">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Bell size={20} />
            Notification Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <div>
                <p className="font-medium text-foreground">Alert Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive notifications for fall detections
                </p>
              </div>
              <Switch defaultChecked onChange={handleNotificationToggle} />
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <div>
                <p className="font-medium text-foreground">Sound Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Play sound when emergency alert is triggered
                </p>
              </div>
              <Switch defaultChecked onChange={handleNotificationToggle} />
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <div>
                <p className="font-medium text-foreground">Email Reports</p>
                <p className="text-sm text-muted-foreground">
                  Send daily health reports to registered email
                </p>
              </div>
              <Switch onChange={handleNotificationToggle} />
            </div>
          </div>
        </Card>

        {/* Data & Privacy */}
        <Card className="border-border p-6">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Lock size={20} />
            Data &amp; Privacy
          </h3>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Your data is stored securely in your browser&apos;s local storage for offline access. No
              data is sent to external servers for this demo.
            </p>
            <div className="mt-4 rounded-lg bg-muted/50 p-4">
              <p className="font-medium text-foreground mb-2">Data Storage</p>
              <ul className="space-y-1 text-muted-foreground text-xs">
                <li>• Patient health information</li>
                <li>• Alert history and timestamps</li>
                <li>• User preferences and theme settings</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Storage Management */}
        <Card className="border-border p-6">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Database size={20} />
            Storage Management
          </h3>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-medium text-foreground mb-2">Local Storage</p>
              <p className="text-xs text-muted-foreground mb-4">
                Clear all stored data including alert history and preferences
              </p>
              <Button
                onClick={handleClearData}
                variant="outline"
                className="text-emergency hover:text-emergency"
                size="sm"
              >
                Clear All Data
              </Button>
            </div>
          </div>
        </Card>

        {/* System Information */}
        <Card className="border-border p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">System Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between rounded-lg bg-muted/50 p-3">
              <span className="text-muted-foreground">Application Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between rounded-lg bg-muted/50 p-3">
              <span className="text-muted-foreground">Framework</span>
              <span className="font-medium">Next.js 16 + React 19</span>
            </div>
            <div className="flex justify-between rounded-lg bg-muted/50 p-3">
              <span className="text-muted-foreground">State Management</span>
              <span className="font-medium">Zustand</span>
            </div>
            <div className="flex justify-between rounded-lg bg-muted/50 p-3">
              <span className="text-muted-foreground">Styling</span>
              <span className="font-medium">Tailwind CSS</span>
            </div>
          </div>
        </Card>

        {/* Account Actions */}
        <Card className="border-border p-6">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
            <LogOut size={20} />
            Account
          </h3>
          <div className="space-y-3">
            <Button
              onClick={handleLogout}
              className="w-full gap-2 bg-primary hover:bg-primary/90 text-white"
            >
              <LogOut size={16} />
              Logout
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              You will be redirected to the login page
            </p>
          </div>
        </Card>

        {/* Help & Support */}
        <Card className="border-border bg-muted/30 p-6">
          <h3 className="mb-3 font-semibold text-foreground">Help & Support</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            This is a demo application for emergency fall detection and caretaker monitoring. For
            real healthcare applications, please ensure HIPAA compliance and proper security
            measures are in place.
          </p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <strong>Emergency Features:</strong> Full-screen alerts, Google Maps integration, real-time
              notifications
            </p>
            <p>
              <strong>Data Persistence:</strong> All data is stored locally using browser LocalStorage
            </p>
            <p>
              <strong>Mobile Responsive:</strong> Works seamlessly on desktop, tablet, and mobile devices
            </p>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
