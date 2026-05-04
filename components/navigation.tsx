'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, TrendingUp, Zap, User, Home, LineChart, History, Bell, Settings, Network } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-card/95 border-b border-secondary/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <Zap className="w-6 h-6" />
            EcoWatt
          </Link>

          {/* Menu */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                isActive('/')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary/20'
              }`}
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/marketplace"
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                isActive('/marketplace')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary/20'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Marketplace
            </Link>
            <Link
              href="/trading"
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                isActive('/trading')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary/20'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Trading
            </Link>
            <Link
              href="/profile"
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                isActive('/profile')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary/20'
              }`}
            >
              <User className="w-4 h-4" />
              Portfolio
            </Link>
            <Link
              href="/analytics"
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                isActive('/analytics')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary/20'
              }`}
            >
              <LineChart className="w-4 h-4" />
              Analytics
            </Link>
            <Link
              href="/blockchain"
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                isActive('/blockchain')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary/20'
              }`}
            >
              <Network className="w-4 h-4" />
              Blockchain
            </Link>
            <Link
              href="/transactions"
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                isActive('/transactions')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary/20'
              }`}
            >
              <History className="w-4 h-4" />
              History
            </Link>
            <Link
              href="/notifications"
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                isActive('/notifications')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary/20'
              }`}
            >
              <Bell className="w-4 h-4" />
              Alerts
            </Link>
            <Link
              href="/settings"
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                isActive('/settings')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary/20'
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex gap-2">
            <Link
              href="/"
              className={`p-2 rounded-lg transition ${
                isActive('/')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary/20'
              }`}
            >
              <Home className="w-5 h-5" />
            </Link>
            <Link
              href="/marketplace"
              className={`p-2 rounded-lg transition ${
                isActive('/marketplace')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary/20'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
            </Link>
            <Link
              href="/trading"
              className={`p-2 rounded-lg transition ${
                isActive('/trading')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary/20'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
            </Link>
            <Link
              href="/profile"
              className={`p-2 rounded-lg transition ${
                isActive('/profile')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary/20'
              }`}
            >
              <User className="w-5 h-5" />
            </Link>
            <Link
              href="/settings"
              className={`p-2 rounded-lg transition ${
                isActive('/settings')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary/20'
              }`}
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
