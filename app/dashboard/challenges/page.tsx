'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Zap, Leaf } from 'lucide-react';
import { toast } from 'sonner';

interface Challenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  target_kg: number;
  reward_xp: number;
  start_date: string;
  end_date: string;
  status: string;
  joined: boolean;
  progress_kg: number;
}

export default function ChallengesPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchChallenges();
    }
  }, [user]);

  const fetchChallenges = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch all active challenges
      const { data: allChallenges } = await supabase
        .from('challenges')
        .select('*')
        .eq('status', 'active')
        .order('start_date');

      // Fetch user's challenge participation
      const { data: participation } = await supabase
        .from('challenge_participants')
        .select('challenge_id, progress_kg')
        .eq('user_id', user.id);

      const participationMap = new Map(
        participation?.map((p) => [p.challenge_id, p.progress_kg]) || []
      );
      const joinedIds = new Set(participation?.map((p) => p.challenge_id) || []);

      if (allChallenges) {
        const challengesWithStatus = allChallenges.map((challenge) => ({
          ...challenge,
          joined: joinedIds.has(challenge.id),
          progress_kg: participationMap.get(challenge.id) || 0,
        }));
        setChallenges(challengesWithStatus);
      }
    } catch (error) {
      toast.error('Failed to load challenges');
      console.error('[v0] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    if (!user) return;

    setJoiningId(challengeId);
    try {
      const { error } = await supabase
        .from('challenge_participants')
        .insert([
          {
            challenge_id: challengeId,
            user_id: user.id,
            progress_kg: 0,
          },
        ]);

      if (error) throw error;
      toast.success('Joined challenge!');
      fetchChallenges();
    } catch (error) {
      toast.error('Failed to join challenge');
      console.error('[v0] Error:', error);
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-8 h-8 text-yellow-600" />
          Community Challenges
        </h1>
        <p className="text-gray-600 mt-2">Join challenges and earn bonus XP rewards</p>
      </div>

      {loading ? (
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <p className="text-center text-gray-500 py-8">Loading challenges...</p>
          </CardContent>
        </Card>
      ) : challenges.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <p className="text-center text-gray-500 py-8">No active challenges at the moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((challenge) => {
            const progressPercent = (challenge.progress_kg / challenge.target_kg) * 100;

            return (
              <Card
                key={challenge.id}
                className={`border-2 transition-all ${
                  challenge.joined
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-200'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{challenge.name}</CardTitle>
                      <CardDescription className="mt-2">
                        {challenge.description}
                      </CardDescription>
                    </div>
                    <div className="text-2xl">{challenge.icon || '🎯'}</div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Rewards */}
                  <div className="flex items-center justify-between bg-yellow-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-600" />
                      <span className="font-semibold text-yellow-700">
                        +{challenge.reward_xp} XP
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">Reward</span>
                  </div>

                  {/* Target */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Target</span>
                    <span className="text-gray-900 font-semibold">
                      {challenge.target_kg}kg
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {challenge.joined && (
                    <>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-600">Progress</span>
                          <span className="text-sm font-medium text-gray-900">
                            {challenge.progress_kg.toFixed(1)}/{challenge.target_kg}kg
                          </span>
                        </div>
                        <Progress value={Math.min(progressPercent, 100)} className="h-3" />
                      </div>

                      {progressPercent >= 100 ? (
                        <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg text-center font-semibold">
                          ✓ Completed!
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600 text-center">
                          {(challenge.target_kg - challenge.progress_kg).toFixed(1)}kg to go
                        </div>
                      )}
                    </>
                  )}

                  {/* Join Button */}
                  {!challenge.joined ? (
                    <Button
                      onClick={() => handleJoinChallenge(challenge.id)}
                      disabled={joiningId === challenge.id}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      {joiningId === challenge.id ? 'Joining...' : 'Join Challenge'}
                    </Button>
                  ) : (
                    <div className="text-center text-sm text-green-700 font-medium">
                      You're participating in this challenge
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
