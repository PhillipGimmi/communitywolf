import { createServerClient } from './server';
import { SavedLocation } from '@/types/dashboard';

// Shared utility functions to eliminate duplication
export async function fetchSavedLocations(userId: string): Promise<SavedLocation[]> {
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

    return data ?? [];
  } catch (error) {
    console.error('Error in fetchSavedLocations:', error);
    throw error;
  }
}

export async function fetchPrimaryLocation(userId: string): Promise<SavedLocation | null> {
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

    return data ?? null;
  } catch (error) {
    console.error('Error in fetchPrimaryLocation:', error);
    return null;
  }
}

export async function createLocation(locationData: Omit<SavedLocation, 'id' | 'created_at' | 'updated_at'>): Promise<SavedLocation> {
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('saved_locations')
      .insert(locationData)
      .select()
      .single();

    if (error) {
      console.error('Error creating saved location:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createLocation:', error);
    throw error;
  }
}

export async function updateLocation(id: string, updates: Partial<SavedLocation>): Promise<SavedLocation> {
  try {
    const supabase = await createServerClient();
    
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
    console.error('Error in updateLocation:', error);
    throw error;
  }
}

export async function deleteLocation(id: string): Promise<void> {
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
    console.error('Error in deleteLocation:', error);
    throw error;
  }
}

export async function unsetPrimaryLocation(userId: string): Promise<void> {
  try {
    const supabase = await createServerClient();
    
    await supabase
      .from('saved_locations')
      .update({ is_primary: false })
      .eq('user_id', userId)
      .eq('is_primary', true);
  } catch (error) {
    console.error('Error unsetting primary location:', error);
    throw error;
  }
}
