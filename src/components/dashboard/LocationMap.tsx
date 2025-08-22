'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { SavedLocation } from '@/types/dashboard';
import { useCountry } from '@/contexts/CountryContext';

interface LocationMapProps {
  readonly locations: SavedLocation[];
  readonly onLocationClick?: (location: SavedLocation) => void;
}

function LocationMap({ locations, onLocationClick }: LocationMapProps) {
  const { userCountry } = useCountry();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const leafletRef = useRef<typeof import('leaflet') | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const initializationRef = useRef<boolean>(false);

  // Generate unique container ID to prevent conflicts
  const containerId = useMemo(() => `leaflet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, []);

  // Process locations data
  const mapData = useMemo(() => {
    const validLocations = locations.filter(
      location => location.latitude && location.longitude
    );
    
    if (validLocations.length === 0) {
      return { center: null, bounds: null, validLocations: [] };
    }
    
    const center: [number, number] = [
      validLocations[0].latitude!,
      validLocations[0].longitude!
    ];
    
    const bounds = validLocations.map(
      location => [location.latitude!, location.longitude!] as [number, number]
    );
    
    return { center, bounds, validLocations };
  }, [locations]);

  // Cleanup function - completely removes all Leaflet traces
  const cleanupMap = useCallback(() => {
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (error) {
        console.log('Map cleanup error:', error);
      }
      mapInstanceRef.current = null;
    }
    
    // Complete DOM cleanup - recreate container to remove all Leaflet state
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    
    initializationRef.current = false;
  }, []);

  // Initialize map with complete DOM recreation
  const initializeMap = useCallback(async () => {
    // Prevent double initialization
    if (!mapData.center || initializationRef.current || !containerRef.current) {
      return;
    }

    try {
      initializationRef.current = true;
      
      // Complete container cleanup - this is the key to preventing the error
      containerRef.current.innerHTML = '';
      
      // Create completely fresh DOM element
      const mapElement = document.createElement('div');
      mapElement.id = containerId;
      mapElement.style.height = '100%';
      mapElement.style.width = '100%';
      mapElement.style.position = 'relative';
      mapElement.style.zIndex = '1';
      
      // Append to container
      containerRef.current.appendChild(mapElement);
      
      // Dynamic import Leaflet
      const L = await import('leaflet');
      leafletRef.current = L;

      // Configure default markers
      delete (L.Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Create map instance on the fresh element
      const map = L.map(mapElement, {
        center: mapData.center,
        zoom: 10,
        zoomControl: true,
        attributionControl: true,
      });

      mapInstanceRef.current = map;

      // Add tile layers
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add fallback tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        zIndex: -1
      }).addTo(map);

      // Add markers and circles for each location
      mapData.validLocations.forEach((location) => {
        const coordinates: [number, number] = [location.latitude!, location.longitude!];
        
        // Create custom icon
        const iconColor = getIconColor(location.name);
        const svgContent = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${iconColor}"/>
        </svg>`;
        const icon = new L.Icon({
          iconUrl: `data:image/svg+xml;base64,${btoa(svgContent)}`,
          iconSize: [24, 24],
          iconAnchor: [12, 24],
          popupAnchor: [0, -24]
        });
        
        // Add marker
        const marker = L.marker(coordinates, { icon }).addTo(map);
        
        // Create popup content
        const popupContent = `
          <div style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 160px;">
            <h3 style="margin: 0 0 8px 0; font-weight: 600; color: #1f2937; font-size: 16px;">${location.name}</h3>
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280; line-height: 1.4;">${location.address}</p>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #9ca3af;">Safety radius: ${location.radius_km}km</p>
            ${location.is_primary ? '<span style="background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;">Primary Location</span>' : ''}
          </div>
        `;
        
        marker.bindPopup(popupContent);
        
        // Add click handler
        if (onLocationClick) {
          marker.on('click', () => onLocationClick(location));
        }
        
        // Add safety radius circle
        L.circle(coordinates, {
          radius: location.radius_km * 1000, // Convert km to meters
          color: location.is_primary ? '#f59e0b' : '#6b7280',
          fillColor: location.is_primary ? '#fef3c7' : '#f3f4f6',
          fillOpacity: 0.3,
          weight: 2,
          opacity: 0.7
        }).addTo(map);
      });

      // Fit map to show all locations
      if (mapData.bounds && mapData.bounds.length > 0) {
        if (mapData.bounds.length === 1) {
          map.setView(mapData.bounds[0], 13);
        } else {
          map.fitBounds(mapData.bounds, { 
            padding: [20, 20],
            maxZoom: 15
          });
        }
      }

      setIsMapReady(true);
      setMapError(null);

    } catch (error) {
      console.error('Map initialization error:', error);
      setMapError(error instanceof Error ? error.message : 'Failed to initialize map');
      initializationRef.current = false;
    }
  }, [mapData, containerId, onLocationClick]);

  // Helper function to get icon color
  const getIconColor = (name: string): string => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('home')) return '#3b82f6';
    if (nameLower.includes('work') || nameLower.includes('office')) return '#10b981';
    return '#6b7280';
  };

  // Initialize map when data is ready
  useEffect(() => {
    if (mapData.center && !isMapReady && !mapError) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(initializeMap, 50);
      return () => clearTimeout(timer);
    }
  }, [mapData.center, isMapReady, mapError, initializeMap]);

  // Cleanup on unmount or when locations change significantly
  useEffect(() => {
    return () => {
      cleanupMap();
    };
  }, [cleanupMap]);

  // Reset map when locations change
  useEffect(() => {
    if (isMapReady && mapInstanceRef.current) {
      setIsMapReady(false);
      cleanupMap();
    }
  }, [locations.length, cleanupMap, isMapReady]);

  // No locations state
  if (!mapData.center) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
        <div className="text-center">
          <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-gray-500 text-sm font-medium">No locations to display</p>
          <p className="text-gray-400 text-xs mt-1">Add a location to see it on the map</p>
        </div>
      </div>
    );
  }

  // Error state
  if (mapError) {
    return (
      <div className="h-96 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <svg className="h-12 w-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-red-600 text-sm font-medium mb-2">Map failed to load</p>
          <p className="text-red-500 text-xs mb-4">{mapError}</p>
          <button 
            onClick={() => {
              setMapError(null);
              setIsMapReady(false);
              cleanupMap();
            }}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Location Map
            </p>
            <p className="text-xs text-gray-500">
              {locations.length} location{locations.length !== 1 ? 's' : ''} in {userCountry?.name ?? 'your area'}
            </p>
          </div>
          {isMapReady && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-gray-500">Live</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Map Container */}
      <div className="relative" style={{ height: 'calc(100% - 60px)' }}>
        <div 
          ref={containerRef}
          className="absolute inset-0"
          style={{ height: '100%', width: '100%' }}
        />
        
        {/* Loading Overlay */}
        {!isMapReady && !mapError && (
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-3"></div>
              <p className="text-sm text-gray-600 font-medium">Loading map...</p>
              <p className="text-xs text-gray-400 mt-1">Initializing location data</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LocationMap;