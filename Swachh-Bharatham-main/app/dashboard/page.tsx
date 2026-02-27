'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardNav } from '@/components/dashboard/nav';
import { StatsOverview } from '@/components/dashboard/stats-overview';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  full_name: string;
  total_waste_kg: number;
  total_points: number;
  level: number;
  avatar_url: string;
}

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile not found, create a default one
          const defaultProfile = {
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            total_waste_kg: 0,
            total_points: 0,
            level: 1,
            avatar_url: ''
          };

          const { data: newProfile, error: insertError } = await supabase
            .from('user_profiles')
            .insert([defaultProfile])
            .select()
            .single();

          if (insertError) throw insertError;
          setProfile(newProfile);
          return;
        }
        throw error;
      }

      setProfile(data);
    } catch (error: any) {
      console.error('[v0] Error fetching profile:', error?.message || error);
    } finally {
      setProfileLoading(false);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg">
                {profile.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {profile.full_name || 'User'}!
                </h1>
                <p className="text-sm text-gray-500">Level {profile.level} • {profile.total_waste_kg.toFixed(1)}kg disposed</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="text-gray-600 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <DashboardNav />

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats Overview */}
            <StatsOverview profile={profile} />

            {/* Quick Actions */}
            <QuickActions />

            {/* Recent Activity */}
            <RecentActivity userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
