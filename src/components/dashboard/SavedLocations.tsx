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
  Navigation
} from 'lucide-react';
import { SavedLocation } from '@/types/dashboard';
import { useCountry } from '@/contexts/CountryContext';
import { AddressLookup } from '@/components/ui/address-lookup';
import { useAuthStore } from '@/lib/auth/auth-store';
import { 
  getSavedLocationsAction, 
  createSavedLocationAction, 
  updateSavedLocationAction, 
  deleteSavedLocationAction 
} from '@/lib/supabase/saved-locations-actions';




interface SavedLocationsProps {
  onLocationUpdate?: () => void;
}

export function SavedLocations({ 
  onLocationUpdate 
}: SavedLocationsProps) {
  const { userCountry } = useCountry();
  const { userProfile } = useAuthStore();

  // Debug logging
  useEffect(() => {
    console.log('🔍 SavedLocations: Component mounted/updated:', {
      hasUserCountry: !!userCountry,
      userCountryId: userCountry?.id,
      userCountryName: userCountry?.name,
      hasUserProfile: !!userProfile,
      userProfileId: userProfile?.id,
      userProfileCountryId: userProfile?.country_id
    });
  }, [userCountry, userProfile]);

  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [editingLocation, setEditingLocation] = useState<SavedLocation | null>(null);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-black">Saved Locations</h2>
          <p className="text-sm sm:text-base text-gray-600">Manage your monitored addresses and safety zones in {userCountry.name}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
          <Button 
            onClick={() => setIsAddingLocation(true)}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-black hover:bg-gray-800 text-white text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Location</span>
          </Button>
        </div>
      </div>

      {/* Add/Edit Location Form */}
      {(isAddingLocation?? editingLocation) && (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </CardTitle>
            <CardDescription className="text-sm">
              {editingLocation ? 'Update your location details' : 'Add a new address to monitor'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-sm">Location Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Home, Work, School"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="radius" className="text-sm">Radius (km)</Label>
                <Input
                  id="radius"
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="50"
                  value={newLocation.radius_km}
                  onChange={(e) => setNewLocation({ ...newLocation, radius_km: parseFloat(e.target.value) })}
                  className="text-sm"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address" className="text-sm">Address</Label>
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <Button 
                onClick={editingLocation ? handleUpdateLocation : handleAddLocation}
                disabled={!newLocation.name || !newLocation.address}
                className="bg-black hover:bg-gray-800 text-white text-sm w-full sm:w-auto"
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
                className="border-black text-black hover:bg-gray-100 text-sm w-full sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
        <>
          {/* Locations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {locations.map((location) => (
              <Card key={location.id} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getLocationIcon(location.name)}
                      </div>
                      <div>
                        <CardTitle className="text-sm sm:text-base">{location.name}</CardTitle>
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
                        className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLocation(location.id)}
                        className="text-black hover:text-gray-700 h-8 w-8 sm:h-9 sm:w-9 p-0"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  <div className="flex items-start space-x-2">
                    <Navigation className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mt-0.5" />
                    <p className="text-xs sm:text-sm text-gray-600">{location.address}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <span className="text-xs sm:text-sm text-gray-500">Radius: {location.radius_km}km</span>
                    {!location.is_primary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetPrimary(location.id)}
                        className="border-black text-black hover:bg-gray-100 text-xs w-full sm:w-auto"
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
              <CardContent className="text-center py-8 sm:py-12">
                <MapPin className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-black mb-2">No locations saved</h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4">
                  Add your first location to start monitoring safety in your area
                </p>
                <Button onClick={() => setIsAddingLocation(true)} className="bg-black hover:bg-gray-800 text-white text-sm w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Location
                </Button>
              </CardContent>
            </Card>
          )}
        </>
    </div>
  );
}
