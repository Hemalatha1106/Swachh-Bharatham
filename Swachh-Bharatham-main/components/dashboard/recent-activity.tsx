'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { Leaf, Zap } from 'lucide-react';

interface WasteLog {
  id: string;
  created_at: string;
  weight_kg: number;
  waste_category_id: string;
  status: string;
}

interface WasteCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export function RecentActivity({ userId }: { userId: string }) {
  const [logs, setLogs] = useState<WasteLog[]>([]);
  const [categories, setCategories] = useState<Map<string, WasteCategory>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories first
      const { data: catData } = await supabase.from('waste_categories').select('*');
      if (catData) {
        const catMap = new Map(catData.map((cat) => [cat.id, cat]));
        setCategories(catMap);
      }

      // Fetch recent waste logs
      const { data: logsData } = await supabase
        .from('waste_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (logsData) {
        setLogs(logsData);
      }
    } catch (error) {
      console.error('[v0] Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest waste disposal records</CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8">
            <Leaf className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No waste logs yet. Start disposing waste to see activity here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => {
              const category = categories.get(log.waste_category_id);
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {category?.name || 'Unknown'} Waste
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{log.weight_kg}kg</p>
                    <p className="text-xs text-green-600 flex items-center justify-end gap-1">
                      <Zap className="w-3 h-3" /> +{log.weight_kg * 10} XP
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
