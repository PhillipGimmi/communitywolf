// src/components/core/CrimeMap.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { CrimeReport } from '@/types/safety';
import type { Map, Layer } from 'leaflet';

let L: typeof import('leaflet');

interface CrimeMapProps {
  reports: CrimeReport[];
}

export function CrimeMap({ reports }: CrimeMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const leaflet = await import('leaflet');
        L = leaflet;

        // Fix for default markers in Next.js
        delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        if (mapContainer.current && !map.current) {
          // Initialize map centered on Johannesburg
          map.current = L.map(mapContainer.current).setView([-26.2041, 28.0473], 11);

          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(map.current);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize map:', err);
        setError('Failed to load map');
        setIsLoading(false);
      }
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !L || reports.length === 0) return;

    // Clear existing markers
    map.current.eachLayer((layer: Layer) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.current?.removeLayer(layer);
      }
    });

    // Add markers for each crime report
    const bounds: [number, number][] = [];

    reports.forEach((report) => {
      const [lng, lat] = report.coordinates.coordinates;
      
      // Create marker color based on severity
      const color = getSeverityColor(report.severity);
      
      // Create custom marker
      const marker = L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: color,
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map.current!);

      // Add popup with crime details
      marker.bindPopup(`
        <div style="max-width: 250px;">
          <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">
            ${report.type}
          </h4>
          <p style="margin: 0 0 4px 0; font-size: 12px;">
            <strong>Severity:</strong> ${report.severity}/5
          </p>
          <p style="margin: 0 0 4px 0; font-size: 12px;">
            <strong>Date:</strong> ${new Date(report.datetime).toLocaleDateString()}
          </p>
          <p style="margin: 0 0 8px 0; font-size: 12px;">
            ${report.summary}
          </p>
          <p style="margin: 0; font-size: 11px; color: #666;">
            Keywords: ${report.keywords.join(', ')}
          </p>
          <p style="margin: 4px 0 0 0; font-size: 10px; color: #999;">
            ID: ${report.newsID}
          </p>
        </div>
      `);

      bounds.push([lat, lng]);
    });

    // Fit map to show all markers
    if (bounds.length > 0) {
      map.current.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [reports]);

  const getSeverityColor = (severity: number): string => {
    switch (severity) {
      case 1: return '#22c55e'; // Green
      case 2: return '#84cc16'; // Light green
      case 3: return '#eab308'; // Yellow
      case 4: return '#f97316'; // Orange
      case 5: return '#ef4444'; // Red
      default: return '#6b7280'; // Gray
    }
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <p>Unable to load map: {error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Crime Locations</h3>
          {reports.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {reports.length} incident{reports.length !== 1 ? 's' : ''} | Geocoded with Nominatim
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="h-96 bg-muted animate-pulse rounded-lg flex items-center justify-center">
            <span className="text-muted-foreground">Loading map...</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div 
              ref={mapContainer} 
              className="h-96 w-full rounded-lg border"
              style={{ minHeight: '384px' }}
            />
            
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Severity:</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Low (1-2)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Medium (3)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>High (4-5)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}