'use server';

import { SavedLocation } from '@/types/dashboard';
import { 
  fetchSavedLocations, 
  fetchPrimaryLocation, 
  createLocation, 
  updateLocation, 
  deleteLocation,
  unsetPrimaryLocation 
} from './saved-locations-utils';

export async function getSavedLocationsAction(userId: string): Promise<SavedLocation[]> {
  return fetchSavedLocations(userId);
}

export async function getPrimaryLocationAction(userId: string): Promise<SavedLocation | null> {
  return fetchPrimaryLocation(userId);
}

export async function createSavedLocationAction(locationData: {
  user_id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  is_primary: boolean;
  radius_km: number;
}): Promise<SavedLocation> {
  try {
    // If this is being set as primary, unset any existing primary location
    if (locationData.is_primary) {
      await unsetPrimaryLocation(locationData.user_id);
    }
    
    return await createLocation(locationData);
  } catch (error) {
    console.error('Error in createSavedLocationAction:', error);
    throw error;
  }
}

export async function updateSavedLocationAction(
  id: string,
  updates: {
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    is_primary?: boolean;
    radius_km?: number;
  }
): Promise<SavedLocation> {
  try {
    // If this is being set as primary, unset any existing primary location
    if (updates.is_primary) {
      const { createServerClient } = await import('./server');
      const supabase = await createServerClient();
      
      const { data: currentLocation } = await supabase
        .from('saved_locations')
        .select('user_id')
        .eq('id', id)
        .single();
      
      if (currentLocation) {
        await unsetPrimaryLocation(currentLocation.user_id);
      }
    }
    
    return await updateLocation(id, updates);
  } catch (error) {
    console.error('Error in updateSavedLocationAction:', error);
    throw error;
  }
}

export async function deleteSavedLocationAction(id: string): Promise<void> {
  return deleteLocation(id);
}

