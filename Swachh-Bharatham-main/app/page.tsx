'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Leaf, Recycle, Trophy, Zap } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin">
            <Leaf className="w-12 h-12 text-green-600" />
          </div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      {/* Navigation */}
      <nav className="border-b border-green-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="w-8 h-8 text-green-600" />
              <h1 className="text-2xl font-bold text-green-700">Swachh Bharatham</h1>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/auth/login')}
              >
                Sign In
              </Button>
              <Button
                onClick={() => router.push('/auth/signup')}
                className="bg-green-600 hover:bg-green-700"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Make a Difference, <span className="text-green-600">One Disposal at a Time</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Swachh Bharatham helps you track your waste disposal, earn rewards, and contribute to a cleaner India.
            </p>
            <div className="flex gap-4">
              <Button
                size="lg"
                onClick={() => router.push('/auth/signup')}
                className="bg-green-600 hover:bg-green-700"
              >
                Start Now
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-600">
              <Recycle className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="font-bold text-lg mb-2">Track Waste</h3>
              <p className="text-sm text-gray-600">Log and monitor your waste disposal activities</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-600">
              <Zap className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="font-bold text-lg mb-2">Earn XP</h3>
              <p className="text-sm text-gray-600">Get points for every waste disposal</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-yellow-600">
              <Trophy className="w-12 h-12 text-yellow-600 mb-4" />
              <h3 className="font-bold text-lg mb-2">Win Badges</h3>
              <p className="text-sm text-gray-600">Unlock achievements and climb the leaderboard</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-600">
              <Leaf className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="font-bold text-lg mb-2">Go Green</h3>
              <p className="text-sm text-gray-600">Be part of India's cleanliness movement</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Tracking</h3>
              <p className="text-gray-600">Use AI to classify waste and track disposal patterns</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Gamification</h3>
              <p className="text-gray-600">Earn badges, levels, and compete on leaderboards</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Recycle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Find Bins</h3>
              <p className="text-gray-600">Locate nearby waste bins using interactive maps</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p>&copy; 2024 Swachh Bharatham. Making India cleaner, one disposal at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
