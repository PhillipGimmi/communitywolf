'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { SavedLocation } from '@/types/dashboard';
import { useCountry } from '@/contexts/CountryContext';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMapProps {
  readonly locations: SavedLocation[];
  readonly onLocationClick?: (location: SavedLocation) => void;
}

// Component to fit map bounds when locations change
function MapBounds({ locations }: { locations: SavedLocation[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (locations.length > 0) {
      // Calculate bounds based on actual location coordinates
      const bounds = locations
        .filter(location => location.latitude && location.longitude)
        .map(location => [location.latitude!, location.longitude!] as [number, number]);
      
      if (bounds.length > 0) {
        try {
          map.fitBounds(bounds, { padding: [20, 20] });
        } catch (error) {
          console.log('Map bounds error:', error);
        }
      }
    }
  }, [locations, map]);
  
  return null;
}

export default function LocationMap({ locations, onLocationClick }: LocationMapProps) {
  const { userCountry } = useCountry();
  const [isClient, setIsClient] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 0]); // Will be set based on actual locations

  // Handle SSR - only render map on client side
  useEffect(() => {
    console.log('LocationMap: Setting client to true');
    setIsClient(true);
  }, []);

  // Update map center based on actual locations
  useEffect(() => {
    if (locations.length > 0) {
      const validLocations = locations.filter(location => 
        location.latitude && location.longitude
      );
      
      if (validLocations.length > 0) {
        const firstLocation = validLocations[0];
        const center: [number, number] = [firstLocation.latitude!, firstLocation.longitude!];
        
        console.log('LocationMap: Setting map center to first location:', center);
        setMapCenter(center);
      }
    }
  }, [locations]);

    console.log('LocationMap render:', {
    isClient,
    locationsCount: locations.length,
    mapCenter,
    userCountry: userCountry
  });

  // Use actual coordinates from saved locations
  const getLocationCoordinates = (location: SavedLocation) => {
    // If location has latitude/longitude, use them
    if (location.latitude && location.longitude) {
      console.log(`Location ${location.name} using lat/lng:`, [location.latitude, location.longitude]);
      return [location.latitude, location.longitude] as LatLngExpression;
    }
    
    // If no coordinates, return null - this location won't be displayed on map
    console.log(`Location ${location.name} has no coordinates, skipping map display`);
    return null;
  };

  const getLocationIcon = (name: string) => {
    // Extract nested ternary into independent function for better readability
    const getIconColor = (locationName: string): string => {
      if (locationName.toLowerCase().includes('home')) return '#3B82F6';
      if (locationName.toLowerCase().includes('work')) return '#10B981';
      return '#6B7280';
    };
    
    const iconColor = getIconColor(name);
    
    // Refactor nested template literals for better readability
    const svgContent = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${iconColor}"/>
      </svg>
    `;
    
    const iconUrl = `data:image/svg+xml;base64,${btoa(svgContent)}`;
    
    return new Icon({
      iconUrl,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24]
    });
  };

  // Don't render map until client-side
  if (!isClient) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <svg className="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-gray-500">No locations to display on map</p>
        </div>
      </div>
    );
  }

  console.log('LocationMap: Rendering map with:', {
    locationsCount: locations.length,
    mapCenter,
    userCountry: userCountry?.name,
    isClient
  });

  return (
    <div className="h-96 rounded-lg border border-gray-200 bg-white relative">
      <div className="p-2 bg-gray-50 border-b border-gray-200">
        <p className="text-sm text-gray-600">
          Map showing {locations.length} location(s) in {userCountry?.name?? 'your area'}
        </p>
      </div>
      <MapContainer
        center={mapCenter}
        zoom={10}
        style={{ height: 'calc(100% - 40px)', width: '100%' }}
        className="z-10"
        key={isClient ? 'map-loaded' : 'map-loading'}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* Fallback tile layer in case OpenStreetMap is blocked */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          zIndex={-1}
        />
        
        <MapBounds locations={locations} />
        
        {locations.map((location) => {
          const coordinates = getLocationCoordinates(location);
          
          // Skip locations without coordinates
          if (!coordinates) {
            return null;
          }
          
          const icon = getLocationIcon(location.name);
          
          return (
            <div key={location.id}>
              <Marker
                position={coordinates}
                icon={icon}
                eventHandlers={{
                  click: () => onLocationClick?.(location)
                }}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-semibold text-black">{location.name}</h3>
                    <p className="text-sm text-gray-600">{location.address}</p>
                    <p className="text-xs text-gray-500">Safety radius: {location.radius_km}km</p>
                    {location.is_primary && (
                      <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mt-1">
                        Primary Location
                      </span>
                    )}
                  </div>
                </Popup>
              </Marker>
              
              {/* Safety radius circle */}
              <Circle
                center={coordinates}
                radius={location.radius_km * 1000} // Convert km to meters
                pathOptions={{
                  color: location.is_primary ? '#F59E0B' : '#6B7280',
                  fillColor: location.is_primary ? '#FEF3C7' : '#F3F4F6',
                  fillOpacity: 0.3,
                  weight: 2
                }}
              />
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}
