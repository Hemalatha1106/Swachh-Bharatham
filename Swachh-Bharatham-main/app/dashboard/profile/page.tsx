'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  bio: string;
  phone: string;
  city: string;
  country: string;
  total_waste_kg: number;
  total_points: number;
  level: number;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    phone: '',
    city: '',
    country: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          ...data,
          email: user.email || '',
        });
        setFormData({
          full_name: data.full_name || '',
          bio: data.bio || '',
          phone: data.phone || '',
          city: data.city || '',
          country: data.country || '',
        });
      }
    } catch (error) {
      toast.error('Failed to load profile');
      console.error('[v0] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(formData)
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('[v0] Error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-8 h-8 text-green-600" />
          Your Profile
        </h1>
        <p className="text-gray-600 mt-2">Manage your account and settings</p>
      </div>

      {/* Profile Header */}
      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-3xl font-bold">
              {profile.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{profile.full_name || 'User'}</h2>
              <p className="text-gray-600">{profile.email}</p>
              <p className="text-sm text-gray-500 mt-1">Level {profile.level}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-gray-200">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-green-600">{profile.total_waste_kg.toFixed(1)}kg</p>
            <p className="text-sm text-gray-600 mt-2">Total Waste Disposed</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-yellow-600">{profile.total_points}</p>
            <p className="text-sm text-gray-600 mt-2">Total Points</p>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Form */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-gray-700 font-medium">
                Full Name
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                disabled={saving}
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-gray-700 font-medium">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={saving}
                className="border-gray-300"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700 font-medium">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  disabled={saving}
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-gray-700 font-medium">
                  City
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={saving}
                  className="border-gray-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-gray-700 font-medium">
                Country
              </Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                disabled={saving}
                className="border-gray-300"
              />
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Section */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700">Account</CardTitle>
          <CardDescription className="text-red-600">Email verified: {profile.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => signOut()}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
