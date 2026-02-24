'use client';

import { useState } from 'react';
import { Menu, X, LogOut, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  onMenuToggle?: (open: boolean) => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout, isDarkMode, toggleDarkMode } = useStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    onMenuToggle?.(!isMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="rounded-lg bg-gradient-to-br from-primary to-primary/60 p-2">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          </div>
          <span className="hidden font-bold text-foreground sm:inline">CareMonitor</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
            Dashboard
          </Link>
          <Link href="/patient-profile" className="text-sm font-medium transition-colors hover:text-primary">
            Patient
          </Link>
          <Link href="/alert-history" className="text-sm font-medium transition-colors hover:text-primary">
            History
          </Link>
          <Link href="/settings" className="text-sm font-medium transition-colors hover:text-primary">
            Settings
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-lg"
          >
            {isDarkMode ? (
              <Sun size={18} className="text-warning" />
            ) : (
              <Moon size={18} />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="hidden rounded-lg sm:inline-flex"
          >
            <LogOut size={18} />
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            className="rounded-lg md:hidden"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-border bg-card/50 backdrop-blur-sm md:hidden">
          <div className="space-y-1 px-4 py-3">
            <Link
              href="/dashboard"
              className="block rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Dashboard
            </Link>
            <Link
              href="/patient-profile"
              className="block rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Patient
            </Link>
            <Link
              href="/alert-history"
              className="block rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              History
            </Link>
            <Link
              href="/settings"
              className="block rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-muted text-emergency"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
