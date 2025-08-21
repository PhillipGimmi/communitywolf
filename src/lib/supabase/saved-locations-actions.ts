'use server';

import { createServerClient } from './server';
import { SavedLocation } from '@/types/dashboard';

export async function getSavedLocationsAction(userId: string): Promise<SavedLocation[]> {
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('saved_locations')
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved locations:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getSavedLocationsAction:', error);
    throw error;
  }
}

export async function getPrimaryLocationAction(userId: string): Promise<SavedLocation | null> {
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('saved_locations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching primary location:', error);
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error in getPrimaryLocationAction:', error);
    return null;
  }
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
    const supabase = await createServerClient();
    
    // If this is being set as primary, unset any existing primary location
    if (locationData.is_primary) {
      await supabase
        .from('saved_locations')
        .update({ is_primary: false })
        .eq('user_id', locationData.user_id)
        .eq('is_primary', true);
    }
    
    const { data, error } = await supabase
      .from('saved_locations')
      .insert([locationData])
      .select()
      .single();

    if (error) {
      console.error('Error creating saved location:', error);
      throw error;
    }

    return data;
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
    const supabase = await createServerClient();
    
    // If this is being set as primary, unset any existing primary location
    if (updates.is_primary) {
      const { data: currentLocation } = await supabase
        .from('saved_locations')
        .select('user_id')
        .eq('id', id)
        .single();
      
      if (currentLocation) {
        await supabase
          .from('saved_locations')
          .update({ is_primary: false })
          .eq('user_id', currentLocation.user_id)
          .eq('is_primary', true);
      }
    }
    
    const { data, error } = await supabase
      .from('saved_locations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating saved location:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateSavedLocationAction:', error);
    throw error;
  }
}

export async function deleteSavedLocationAction(id: string): Promise<void> {
  try {
    const supabase = await createServerClient();
    
    const { error } = await supabase
      .from('saved_locations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting saved location:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteSavedLocationAction:', error);
    throw error;
  }
}
