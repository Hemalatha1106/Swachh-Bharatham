'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Leaf, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface UserRanking {
  id: string;
  full_name: string;
  total_waste_kg: number;
  total_points: number;
  disposals_count: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  waste_kg: number;
  points: number;
  level: number;
}

export default function LeaderboardPage() {
  const [wasteLeaderboard, setWasteLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [pointsLeaderboard, setPointsLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    setLoading(true);
    try {
      // Fetch user profiles with stats
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, total_waste_kg, total_points, level')
        .order('total_waste_kg', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (data) {
        // Create waste leaderboard
        const wasteBoard = data.map((user, index) => ({
          rank: index + 1,
          name: user.full_name || 'Anonymous',
          waste_kg: user.total_waste_kg,
          points: user.total_points,
          level: user.level,
        }));

        // Create points leaderboard
        const pointsBoard = [...data]
          .sort((a, b) => b.total_points - a.total_points)
          .map((user, index) => ({
            rank: index + 1,
            name: user.full_name || 'Anonymous',
            waste_kg: user.total_waste_kg,
            points: user.total_points,
            level: user.level,
          }));

        setWasteLeaderboard(wasteBoard);
        setPointsLeaderboard(pointsBoard);
      }
    } catch (error) {
      toast.error('Failed to load leaderboards');
      console.error('[v0] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const LeaderboardTable = ({ data, metric }: { data: LeaderboardEntry[]; metric: 'waste' | 'points' }) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Rank</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">User</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-900">Level</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-900">
              {metric === 'waste' ? 'Waste Disposed' : 'Points'}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 20).map((entry) => (
            <tr key={entry.rank} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  {entry.rank === 1 && <Trophy className="w-5 h-5 text-yellow-500" />}
                  {entry.rank === 2 && <Trophy className="w-5 h-5 text-gray-400" />}
                  {entry.rank === 3 && <Trophy className="w-5 h-5 text-orange-400" />}
                  <span className="font-bold text-gray-900">#{entry.rank}</span>
                </div>
              </td>
              <td className="py-3 px-4 font-medium text-gray-900">{entry.name}</td>
              <td className="py-3 px-4 text-right">
                <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  Lvl {entry.level}
                </span>
              </td>
              <td className="py-3 px-4 text-right font-semibold text-gray-900">
                {metric === 'waste' ? (
                  <div className="flex items-center justify-end gap-1">
                    <Leaf className="w-4 h-4 text-green-600" />
                    {entry.waste_kg.toFixed(1)} kg
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-1">
                    <Zap className="w-4 h-4 text-yellow-600" />
                    {entry.points.toLocaleString()}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Trophy className="w-8 h-8 text-yellow-600" />
          Global Leaderboard
        </h1>
        <p className="text-gray-600 mt-2">See how you rank among other eco-warriors</p>
      </div>

      {loading ? (
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <p className="text-center text-gray-500 py-8">Loading leaderboards...</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="waste" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="waste" className="flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              Waste Disposed
            </TabsTrigger>
            <TabsTrigger value="points" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Points Earned
            </TabsTrigger>
          </TabsList>

          <TabsContent value="waste">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Top Waste Disposers</CardTitle>
                <CardDescription>Ranked by total waste disposed</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaderboardTable data={wasteLeaderboard} metric="waste" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="points">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Top Points Earners</CardTitle>
                <CardDescription>Ranked by total points earned</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaderboardTable data={pointsLeaderboard} metric="points" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
