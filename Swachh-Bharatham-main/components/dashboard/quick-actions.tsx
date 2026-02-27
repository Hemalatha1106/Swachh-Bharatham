'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Map, QrCode, Zap } from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      title: 'Log Waste',
      description: 'Record your waste disposal',
      icon: Trash2,
      href: '/dashboard/waste',
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
    },
    {
      title: 'Scan QR Code',
      description: 'Scan bin QR code',
      icon: QrCode,
      href: '/dashboard/scan',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      title: 'Find Bins',
      description: 'Locate nearest bins',
      icon: Map,
      href: '/dashboard/map',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
    },
    {
      title: 'View Challenges',
      description: 'Join community challenges',
      icon: Zap,
      href: '/dashboard/challenges',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 hover:bg-yellow-100',
    },
  ];

  return (
    <Card className="border-gray-200">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <div className={`p-4 rounded-lg border border-gray-200 transition-all ${action.bgColor} cursor-pointer h-full`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-white`}>
                    <Icon className={`w-6 h-6 ${action.color}`} />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{action.title}</h4>
                  <p className="text-xs text-gray-600">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
