'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Bin {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  location_address: string;
  current_fill: number;
}

interface BinMapProps {
  bins: Bin[];
  userLocation: { lat: number; lng: number };
}

const createCustomIcon = (color: string) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <path d="M6 9c0-1.5.5-3 1.5-4.2C9 3.3 10.5 3 12 3s3 .3 4.5 1.8C19.5 6 20 7.5 20 9c0 2-1 4-2.5 5.5l-5 5-5-5C7 13 6 11 6 9z"></path>
      </svg>
    </div>`,
    iconSize: [36, 36],
    className: 'custom-marker',
  });
};

const createUserIcon = () => {
  return L.divIcon({
    html: `<div style="background-color: #3B82F6; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
      <div style="width: 12px; height: 12px; background-color: white; border-radius: 50%;"></div>
    </div>`,
    iconSize: [36, 36],
    className: 'user-marker',
  });
};

export default function BinMap({ bins, userLocation }: BinMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize map
    mapRef.current = L.map(containerRef.current).setView(
      [userLocation.lat, userLocation.lng],
      13
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapRef.current);

    // Add user marker
    L.marker([userLocation.lat, userLocation.lng], {
      icon: createUserIcon(),
    })
      .bindPopup('<p style="margin: 0; font-weight: bold;">Your Location</p>')
      .addTo(mapRef.current);

    // Add bin markers
    bins.forEach((bin) => {
      const fillColor =
        bin.current_fill < 50
          ? '#10B981'
          : bin.current_fill < 80
          ? '#F59E0B'
          : '#EF4444';

      L.marker([bin.latitude, bin.longitude], {
        icon: createCustomIcon(fillColor),
      })
        .bindPopup(
          `<div style="min-width: 250px;">
            <h4 style="margin: 0 0 8px 0; font-weight: bold;">${bin.name}</h4>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${bin.location_address}</p>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">Type: ${bin.bin_type}</p>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
              <span style="display: inline-block; background-color: ${fillColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                ${bin.current_fill}% Full
              </span>
            </div>
          </div>`
        )
        .addTo(mapRef.current);
    });

    return () => {
      mapRef.current?.remove();
    };
  }, [bins, userLocation]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-96 rounded-lg overflow-hidden border border-gray-200"
    />
  );
}
