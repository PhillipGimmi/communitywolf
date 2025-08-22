'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Circle } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { AddressLookup } from '@/components/ui/address-lookup';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CrimeReportMapProps {
  onMapClick: (coordinates: { lat: number; lng: number }, address?: string) => void;
  initialCoordinates?: { lat: number; lng: number } | null;
  userCountry: { code: string; name: string; emergency_number?: string };
  isFullScreen?: boolean;
  radiusKm?: number;
  onAddressSelect?: (address: { display_name: string; lat: string; lon: string }) => void;
}

// Component to handle map clicks
function MapClickHandler({ onMapClick }: { onMapClick: (coordinates: { lat: number; lng: number }, address?: string) => void }) {
  const map = useMap();

  useEffect(() => {
    const handleClick = async (e: { latlng: { lat: number; lng: number } }) => {
      const { lat, lng } = e.latlng;
      
      try {
        console.log('🔧 MapClickHandler: Clicked at coordinates:', lat, lng);
        
        // Reverse geocode to get address using our API
        const response = await fetch(
          `/api/geocoding/reverse?` +
          `lat=${lat}&lon=${lng}&zoom=18`
        );
        
        console.log('🔧 MapClickHandler: API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('🔧 MapClickHandler: API response data:', data);
          
          const address = data.result?.display_name ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          console.log('🔧 MapClickHandler: Resolved address:', address);
          
          onMapClick({ lat, lng }, address);
        } else {
          console.error('🔧 MapClickHandler: API response not ok:', response.status);
          const errorText = await response.text();
          console.error('🔧 MapClickHandler: Error response:', errorText);
          onMapClick({ lat, lng });
        }
      } catch (error) {
        console.error('🔧 MapClickHandler: Address lookup failed:', error);
        onMapClick({ lat, lng });
      }
    };

    console.log('🔧 MapClickHandler: Binding click event to map');
    map.on('click', handleClick);
    
    // Also add a simple test click handler to verify events are working
    const testHandler = () => console.log('🔧 MapClickHandler: Test click event received');
    map.on('click', testHandler);
    
    return () => {
      console.log('🔧 MapClickHandler: Cleaning up click event handlers');
      map.off('click', handleClick);
      map.off('click', testHandler);
    };
  }, [map, onMapClick]);

  return null;
}

export default function CrimeReportMap({ onMapClick, initialCoordinates, userCountry, isFullScreen, onAddressSelect, radiusKm }: Readonly<CrimeReportMapProps>) {
  const [isClient, setIsClient] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-26.2041, 28.0473]); // Default Johannesburg

  // Handle SSR - only render map on client side
  useEffect(() => {
    setIsClient(true);

    // Set map center based on user's country
    if (userCountry?.code) {
      const countryCenters: Record<string, [number, number]> = {
        'ZA': [-26.2041, 28.0473], // South Africa
        'US': [39.8283, -98.5795],  // United States
        'GB': [55.3781, -3.4360],   // United Kingdom
        'CA': [56.1304, -106.3468], // Canada
        'AU': [-25.2744, 133.7751], // Australia
        'DE': [51.1657, 10.4515],   // Germany
        'FR': [46.2276, 2.2137],    // France
        'IN': [20.5937, 78.9629],   // India
        'CN': [35.8617, 104.1954],  // China
        'JP': [36.2048, 138.2529],  // Japan
      };

      const center = countryCenters[userCountry.code] ?? [-26.2041, 28.0473];
      setMapCenter(center);
    }
    
    console.log('🔧 CrimeReportMap: Component mounted with initialCoordinates:', initialCoordinates);
    }, [userCountry, initialCoordinates]);
  
  // Update map center when initialCoordinates change (e.g., when address is selected from dropdown)
  useEffect(() => {
    if (initialCoordinates?.lat && initialCoordinates?.lng) {
      console.log('🔧 CrimeReportMap: Updating map center to initialCoordinates:', initialCoordinates);
      setMapCenter([initialCoordinates.lat, initialCoordinates.lng]);
    }
  }, [initialCoordinates]);
  
  const handleAddressSelect = (address: { display_name: string; lat: string; lon: string }) => {
    console.log('🔧 CrimeReportMap: Address selected from dropdown:', address);
    
    if (onAddressSelect) {
      onAddressSelect(address);
    }
    
    // Move map to the selected location
    const lat = parseFloat(address.lat);
    const lng = parseFloat(address.lon);
    setMapCenter([lat, lng]);
    
    // Trigger map click to set coordinates and update parent
    onMapClick({ lat, lng }, address.display_name);
  };

  // Component to handle map movement when address is selected
  function MapMover({ center }: { center: [number, number] }) {
    const map = useMap();
    
    useEffect(() => {
      if (center && center[0] !== 0 && center[1] !== 0) {
        map.setView(center, map.getZoom());
      }
    }, [center, map]);
    
    return null;
  }

  // Don't render map until client-side
  if (!isClient) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isFullScreen ? 'h-full' : 'h-96'} relative`}>
      {!isFullScreen && (
        <div className="absolute top-2 left-2 z-10 bg-white px-3 py-2 rounded-lg shadow-md border border-gray-200">
          <p className="text-sm text-gray-700 font-medium">Click on map to select location</p>
          <p className="text-xs text-gray-500">Or use address search above</p>
        </div>
      )}
      
                           {isFullScreen && (
          <div className="absolute top-2 left-2 right-2 z-10 bg-white px-4 py-3 rounded-lg shadow-md border border-gray-200">
            <div className="flex flex-col space-y-3">
              <AddressLookup
                onAddressSelect={handleAddressSelect}
                placeholder="Type an address to search..."
                className="w-full"
              />
              <div className="text-sm text-gray-600">
                <p>• Click anywhere on the map to select a location</p>
                <p>• Or type an address above to search and select</p>
              </div>
            </div>
          </div>
        )}
      
      <MapContainer
        center={mapCenter}
        zoom={isFullScreen ? 10 : 12}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Fallback tile layer */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          zIndex={-1}
        />

                 {/* Handle map clicks */}
         <MapClickHandler onMapClick={onMapClick} />

         {/* Handle map movement when address is selected */}
         <MapMover center={mapCenter} />

                  {/* Show marker and radius circle if coordinates are provided */}
          {initialCoordinates && (
           <>
             <Marker
               position={[initialCoordinates.lat, initialCoordinates.lng] as LatLngExpression}
             />
             {/* Show radius circle if radiusKm is provided */}
             {radiusKm && (
               <Circle
                 center={[initialCoordinates.lat, initialCoordinates.lng] as LatLngExpression}
                 radius={radiusKm * 1000} // Convert km to meters
                 pathOptions={{
                   color: 'red',
                   fillColor: 'red',
                   fillOpacity: 0.1,
                   weight: 2
                 }}
               />
             )}
           </>
         )}
      </MapContainer>
    </div>
  );
}
