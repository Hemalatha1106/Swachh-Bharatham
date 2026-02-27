'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Map as MapIcon } from 'lucide-react';
import { toast } from 'sonner';

const MapComponent = dynamic(
  () => import('@/components/map/bin-map'),
  { 
    loading: () => <div className="w-full h-96 bg-gray-200 rounded-lg animate-pulse" />,
    ssr: false 
  }
);

interface Bin {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  location_address: string;
  current_fill: number;
  bin_type: string;
}

export default function MapPage() {
  const [bins, setBins] = useState<Bin[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetchBins();
    getUserLocation();
  }, []);

  const fetchBins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bins')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      setBins(data || []);
    } catch (error) {
      toast.error('Failed to load bins');
      console.error('[v0] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Default to Delhi if location denied
          setUserLocation({ lat: 28.6139, lng: 77.209 });
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <MapIcon className="w-8 h-8 text-green-600" />
          Find Waste Bins
        </h1>
        <p className="text-gray-600 mt-2">Locate the nearest waste management bins</p>
      </div>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>Bin Locator Map</CardTitle>
          <CardDescription>
            {bins.length} bins found. Click on a bin to view details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="w-full h-96 bg-gray-200 rounded-lg animate-pulse" />
          ) : userLocation ? (
            <MapComponent bins={bins} userLocation={userLocation} />
          ) : (
            <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-600">Loading map...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bins List */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>Nearby Bins</CardTitle>
          <CardDescription>All available waste collection points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bins.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No bins available</p>
            ) : (
              bins.slice(0, 10).map((bin) => (
                <div
                  key={bin.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{bin.name}</h4>
                      <p className="text-sm text-gray-600">{bin.location_address}</p>
                      <p className="text-xs text-gray-500 mt-1">Type: {bin.bin_type}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                        bin.current_fill < 50
                          ? 'bg-green-100 text-green-700'
                          : bin.current_fill < 80
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {bin.current_fill}% Full
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
