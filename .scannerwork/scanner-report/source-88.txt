import { createServerClient } from '@/lib/supabase/server';
import { SavedLocation } from '@/types/dashboard';

export async function getSavedLocations(userId: string): Promise<SavedLocation[]> {
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
    console.error('Error in getSavedLocations:', error);
    throw error;
  }
}

export async function getPrimaryLocation(userId: string): Promise<SavedLocation | null> {
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
    console.error('Error in getPrimaryLocation:', error);
    return null;
  }
}

export async function createSavedLocation(locationData: Omit<SavedLocation, 'id' | 'created_at' | 'updated_at'>): Promise<SavedLocation> {
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
    console.error('Error in createSavedLocation:', error);
    throw error;
  }
}

export async function updateSavedLocation(id: string, updates: Partial<SavedLocation>): Promise<SavedLocation> {
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
    console.error('Error in updateSavedLocation:', error);
    throw error;
  }
}

export async function deleteSavedLocation(id: string): Promise<void> {
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
    console.error('Error in deleteSavedLocation:', error);
    throw error;
  }
}
