'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Star,
  Home,
  Building,
  Navigation,
  Map,
  List
} from 'lucide-react';
import { SavedLocation } from '@/types/dashboard';
import { useCountryFilter } from '@/lib/utils/country-filter';
import { AddressLookup } from '@/components/ui/address-lookup';
import { useAuthStore } from '@/lib/auth/auth-store';
import { 
  getSavedLocationsAction, 
  createSavedLocationAction, 
  updateSavedLocationAction, 
  deleteSavedLocationAction 
} from '@/lib/supabase/saved-locations-actions';
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const LocationMap = dynamic(() => import('./LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
        <p className="text-gray-500">Loading map...</p>
      </div>
    </div>
  ),
});

interface SavedLocationsProps {
  initialViewMode?: 'list' | 'map';
  onLocationUpdate?: () => void;
}

export function SavedLocations({ initialViewMode = 'list', onLocationUpdate }: SavedLocationsProps) {
  const { userCountry } = useCountryFilter();
  const { userProfile } = useAuthStore();
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [editingLocation, setEditingLocation] = useState<SavedLocation | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>(initialViewMode);
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    radius_km: 5.0,
    coordinates: undefined as { lat: number; lng: number } | undefined
  });

  useEffect(() => {
    // Fetch saved locations from Supabase
    if (!userCountry || !userProfile?.id) return;
    
    const fetchLocations = async () => {
      try {
        const savedLocations = await getSavedLocationsAction(userProfile.id);
        setLocations(savedLocations);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setLocations([]);
      }
    };

    fetchLocations();
  }, [userCountry, userProfile?.id]);

  const handleAddLocation = async () => {
    if (newLocation.name && newLocation.address && userProfile?.id) {
      try {
        const locationData = {
          user_id: userProfile.id,
          name: newLocation.name,
          address: newLocation.address,
          latitude: newLocation.coordinates?.lat,
          longitude: newLocation.coordinates?.lng,
          is_primary: locations.length === 0,
          radius_km: newLocation.radius_km
        };
        
        const savedLocation = await createSavedLocationAction(locationData);
        setLocations([...locations, savedLocation]);
        setNewLocation({ name: '', address: '', radius_km: 5.0, coordinates: undefined });
        setIsAddingLocation(false);
        
        // Notify parent component to refresh primary location
        if (onLocationUpdate) {
          onLocationUpdate();
        }
      } catch (error) {
        console.error('Error adding location:', error);
        // You could add a toast notification here
      }
    }
  };

  const handleEditLocation = (location: SavedLocation) => {
    setEditingLocation(location);
    setNewLocation({
      name: location.name,
      address: location.address,
      radius_km: location.radius_km,
      coordinates: location.latitude && location.longitude ? {
        lat: location.latitude,
        lng: location.longitude
      } : undefined
    });
  };

  const handleUpdateLocation = async () => {
    if (editingLocation && newLocation.name && newLocation.address) {
      try {
        const updates = {
          name: newLocation.name,
          address: newLocation.address,
          latitude: newLocation.coordinates?.lat,
          longitude: newLocation.coordinates?.lng,
          radius_km: newLocation.radius_km
        };
        
        const updatedLocation = await updateSavedLocationAction(editingLocation.id, updates);
        setLocations(locations.map(loc => 
          loc.id === editingLocation.id ? updatedLocation : loc
        ));
        setEditingLocation(null);
        setNewLocation({ name: '', address: '', radius_km: 5.0, coordinates: undefined });
        
        // Notify parent component to refresh primary location
        if (onLocationUpdate) {
          onLocationUpdate();
        }
      } catch (error) {
        console.error('Error updating location:', error);
        // You could add a toast notification here
      }
    }
  };

  const handleDeleteLocation = async (id: string) => {
    try {
      await deleteSavedLocationAction(id);
      setLocations(locations.filter(loc => loc.id !== id));
      
      // Notify parent component to refresh primary location
      if (onLocationUpdate) {
        onLocationUpdate();
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      // You could add a toast notification here
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await updateSavedLocationAction(id, { is_primary: true });
      setLocations(locations.map(loc => ({
        ...loc,
        is_primary: loc.id === id
      })));
      
      // Notify parent component to refresh primary location
      if (onLocationUpdate) {
        onLocationUpdate();
      }
    } catch (error) {
      console.error('Error setting primary location:', error);
      // You could add a toast notification here
    }
  };

  const getLocationIcon = (name: string) => {
    if (name.toLowerCase().includes('home')) return <Home className="h-5 w-5" />;
    if (name.toLowerCase().includes('work')) return <Building className="h-5 w-5" />;
    return <MapPin className="h-5 w-5" />;
  };

  // Show loading state while country data is loading
  if (!userCountry) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading country data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no country data
  if (!userCountry) {
    return (
      <div className="space-y-6">
        <div className="text-center p-12">
          <p className="text-gray-600">Unable to load country data. Please check your profile settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black">Saved Locations</h2>
          <p className="text-gray-600">Manage your monitored addresses and safety zones in {userCountry.name}</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-200 rounded-lg p-1 bg-white">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={`rounded-md ${
                viewMode === 'list' 
                  ? 'bg-black hover:bg-gray-800 text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('map')}
              className={`rounded-md ${
                viewMode === 'map' 
                  ? 'bg-black hover:bg-gray-800 text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Map className="h-4 w-4 mr-2" />
              Map
            </Button>
          </div>
          <Button 
            onClick={() => setIsAddingLocation(true)}
            className="flex items-center space-x-2 bg-black hover:bg-gray-800 text-white"
          >
            <Plus className="h-4 w-4" />
            <span>Add Location</span>
          </Button>
        </div>
      </div>

      {/* Add/Edit Location Form */}
      {(isAddingLocation || editingLocation) && (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </CardTitle>
            <CardDescription>
              {editingLocation ? 'Update your location details' : 'Add a new address to monitor'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Location Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Home, Work, School"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="radius">Radius (km)</Label>
                <Input
                  id="radius"
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="50"
                  value={newLocation.radius_km}
                  onChange={(e) => setNewLocation({ ...newLocation, radius_km: parseFloat(e.target.value) })}
                />
              </div>
            </div>
                         <div>
               <Label htmlFor="address">Address</Label>
               <AddressLookup
                 onAddressSelect={(address) => {
                   setNewLocation({
                     ...newLocation,
                     address: address.display_name,
                     coordinates: {
                       lat: parseFloat(address.lat),
                       lng: parseFloat(address.lon)
                     }
                   });
                 }}
                 placeholder="Search for an address..."
               />
             </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={editingLocation ? handleUpdateLocation : handleAddLocation}
                disabled={!newLocation.name || !newLocation.address}
                className="bg-black hover:bg-gray-800 text-white"
              >
                {editingLocation ? 'Update Location' : 'Add Location'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddingLocation(false);
                  setEditingLocation(null);
                  setNewLocation({ name: '', address: '', radius_km: 5.0, coordinates: undefined });
                }}
                className="border-black text-black hover:bg-gray-100"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content based on view mode */}
      {viewMode === 'map' ? (
        <LocationMap 
          locations={locations} 
          onLocationClick={(location) => {
            handleEditLocation(location);
            setViewMode('list');
          }}
        />
      ) : (
        <>
          {/* Locations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((location) => (
              <Card key={location.id} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getLocationIcon(location.name)}
                      </div>
                      <div>
                        <CardTitle className="text-base">{location.name}</CardTitle>
                        {location.is_primary && (
                          <Badge className="bg-gray-100 text-black text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Primary
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditLocation(location)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLocation(location.id)}
                        className="text-black hover:text-gray-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Navigation className="h-4 w-4 text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-600">{location.address}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Radius: {location.radius_km}km</span>
                    {!location.is_primary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetPrimary(location.id)}
                        className="border-black text-black hover:bg-gray-100"
                      >
                        Set as Primary
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {locations.length === 0 && !isAddingLocation && (
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="text-center py-12">
                <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-black mb-2">No locations saved</h3>
                <p className="text-gray-500 mb-4">
                  Add your first location to start monitoring safety in your area
                </p>
                <Button onClick={() => setIsAddingLocation(true)} className="bg-black hover:bg-gray-800 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Location
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
