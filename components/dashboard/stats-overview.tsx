'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Leaf, Trophy, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface StatsOverviewProps {
  profile: {
    total_waste_kg: number;
    total_points: number;
    level: number;
  };
}

export function StatsOverview({ profile }: StatsOverviewProps) {
  const xpToNextLevel = (profile.level * 1000) - profile.total_points;
  const xpProgress = (profile.total_points % 1000) / 1000 * 100;

  const stats = [
    {
      title: 'Total Waste Disposed',
      value: `${profile.total_waste_kg.toFixed(1)} kg`,
      icon: Leaf,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Points',
      value: profile.total_points.toLocaleString(),
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Current Level',
      value: `Level ${profile.level}`,
      icon: Trophy,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Monthly Average',
      value: `${(profile.total_waste_kg / 12).toFixed(1)} kg`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-gray-200">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* XP Progress */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Level Progress</CardTitle>
          <CardDescription>
            {profile.total_points % 1000} / 1000 XP to next level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={xpProgress} className="h-3" />
          <p className="text-sm text-gray-500 mt-3">
            {xpToNextLevel > 0 ? `${xpToNextLevel} XP remaining` : 'Ready to level up!'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
