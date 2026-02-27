'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Trash2,
  Map,
  Trophy,
  Settings,
  Users,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/waste', icon: Trash2, label: 'Log Waste' },
  { href: '/dashboard/map', icon: Map, label: 'Find Bins' },
  { href: '/dashboard/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { href: '/dashboard/achievements', icon: Trophy, label: 'Achievements' },
  { href: '/dashboard/profile', icon: Settings, label: 'Profile' },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <aside className="lg:col-span-1">
      <nav className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-20">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 text-sm">Navigation</h3>
        </div>
        <ul className="divide-y divide-gray-100">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-green-50 text-green-700 border-l-4 border-green-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
