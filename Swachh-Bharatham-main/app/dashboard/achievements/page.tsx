'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria_kg: number | null;
  criteria_count: number | null;
  color: string;
  earned: boolean;
}

interface UserStats {
  total_waste_kg: number;
  total_points: number;
}

export default function AchievementsPage() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch user stats
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('total_waste_kg, total_points')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserStats(profile);
      }

      // Fetch all badges
      const { data: allBadges } = await supabase.from('badges').select('*');

      // Fetch earned badges
      const { data: earnedBadges } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', user.id);

      const earnedIds = new Set(earnedBadges?.map((b) => b.badge_id) || []);

      if (allBadges) {
        const badgesWithStatus = allBadges.map((badge) => ({
          ...badge,
          earned: earnedIds.has(badge.id),
        }));
        setBadges(badgesWithStatus);
      }
    } catch (error) {
      toast.error('Failed to load badges');
      console.error('[v0] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (badge: Badge, stats: UserStats) => {
    if (badge.criteria_kg) {
      return Math.min((stats.total_waste_kg / badge.criteria_kg) * 100, 100);
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Star className="w-8 h-8 text-yellow-600" />
          Achievements & Badges
        </h1>
        <p className="text-gray-600 mt-2">Earn badges by completing challenges</p>
      </div>

      {loading ? (
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <p className="text-center text-gray-500 py-8">Loading badges...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary */}
          {userStats && (
            <Card className="border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-700">
                      {badges.filter((b) => b.earned).length}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Badges Earned</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-700">
                      {userStats.total_waste_kg.toFixed(1)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">kg Disposed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-yellow-700">
                      {userStats.total_points}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Badges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges.map((badge) => (
              <Card
                key={badge.id}
                className={`border-2 transition-all ${
                  badge.earned
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-gray-200 opacity-75'
                }`}
              >
                <CardContent className="pt-6">
                  <div className="text-center">
                    {/* Badge Icon */}
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl relative ${
                        badge.earned
                          ? 'bg-yellow-200'
                          : 'bg-gray-200'
                      }`}
                    >
                      {badge.icon || '🏆'}
                      {!badge.earned && (
                        <Lock className="absolute bottom-0 right-0 w-5 h-5 text-gray-600 bg-white rounded-full p-0.5" />
                      )}
                    </div>

                    {/* Badge Info */}
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {badge.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {badge.description}
                    </p>

                    {/* Progress */}
                    {!badge.earned && userStats && badge.criteria_kg && (
                      <>
                        <div className="space-y-2 mt-4">
                          <Progress
                            value={getProgressPercentage(badge, userStats)}
                            className="h-2"
                          />
                          <p className="text-xs text-gray-500">
                            {userStats.total_waste_kg.toFixed(1)} / {badge.criteria_kg} kg
                          </p>
                        </div>
                      </>
                    )}

                    {/* Status */}
                    {badge.earned ? (
                      <div className="mt-4 bg-yellow-100 text-yellow-700 px-3 py-2 rounded-full text-sm font-medium">
                        ✓ Earned
                      </div>
                    ) : (
                      <div className="mt-4 text-gray-500 text-sm">
                        Locked
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
