'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getCurrentUser, getUserProfileWithDetails } from '@/lib/auth/server-utils';

export interface CrimeReportSubmission {
  country_id: string;
  created_by: string;
  datetime: string;
  address?: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  summary?: string;
  description?: string;
  keywords?: string[];
  coordinates?: { lat: number; lng: number };
  radius_km?: number;
}

export async function submitCrimeReport(reportData: Omit<CrimeReportSubmission, 'country_id' | 'created_by'>) {
  try {
    // Get current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Get user profile to get country_id
    const userProfile = await getUserProfileWithDetails(currentUser.id);
    if (!userProfile) {
      throw new Error('User profile not found');
    }

    const supabase = await createServerClient();
    
    console.log('🔧 CrimeReports: Supabase client created:', typeof supabase, supabase);
    
    // For now, let's store the crime report in a simpler way
    // We'll create a basic structure that can be enhanced later
    
    // Try to insert directly into crime_reports table first
    try {
      console.log('🔧 CrimeReports: Attempting to insert into crime_reports table');
      
      console.log('🔧 CrimeReports: Inserting data:', {
        country_id: userProfile.country_id,
        created_by: currentUser.id,
        datetime: reportData.datetime,
        address: reportData.address,
        type: reportData.type,
        severity: reportData.severity,
        summary: reportData.summary,
        description: reportData.coordinates 
          ? `${reportData.description || ''}\n\nLocation: ${reportData.coordinates.lat}, ${reportData.coordinates.lng}\nRadius: ${reportData.radius_km}km`
          : reportData.description,
        keywords: reportData.keywords || []
      });

      const { data, error } = await supabase
        .from('crime_reports')
        .insert({
          country_id: userProfile.country_id,
          created_by: currentUser.id,
          datetime: reportData.datetime,
          address: reportData.address,
          type: reportData.type,
          severity: reportData.severity,
          summary: reportData.summary,
          description: reportData.coordinates 
            ? `${reportData.description || ''}\n\nLocation: ${reportData.coordinates.lat}, ${reportData.coordinates.lng}\nRadius: ${reportData.radius_km}km`
            : reportData.description,
          keywords: reportData.keywords || []
        })
        .select()
        .single();

      if (error) {
        console.error('🔧 CrimeReports: Error inserting into crime_reports table:', error);
        throw error;
      }

      console.log('🔧 CrimeReports: Successfully inserted into crime_reports table:', data);
      
      // Revalidate the dashboard to show the new report
      revalidatePath('/dashboard');
      
      return { success: true, data, id: data.id };
      
    } catch (tableError) {
      console.log('🔧 CrimeReports: Table insertion failed, falling back to user profile:', tableError);
      
      // Fallback: Store the report data in the user's profile preferences
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          preferences: {
            ...userProfile.preferences,
            crime_reports: [
              ...(userProfile.preferences?.crime_reports || []),
              {
                id: crypto.randomUUID(),
                type: reportData.type,
                severity: reportData.severity,
                summary: reportData.summary,
                description: reportData.coordinates 
                  ? `${reportData.description || ''}\n\nLocation: ${reportData.coordinates.lat}, ${reportData.coordinates.lng}\nRadius: ${reportData.radius_km}km`
                  : reportData.description,
                address: reportData.address,
                datetime: reportData.datetime,
                coordinates: reportData.coordinates,
                radius_km: reportData.radius_km,
                keywords: reportData.keywords || [],
                created_at: new Date().toISOString()
              }
            ]
          }
        })
        .eq('id', currentUser.id);

      if (updateError) {
        console.error('Error storing crime report in profile:', updateError);
        throw new Error(`Failed to store report: ${updateError.message}`);
      }

      // Revalidate the dashboard
      revalidatePath('/dashboard');
      
      return { success: true, data: { id: crypto.randomUUID() }, storedInProfile: true };
    }
    
  } catch (error) {
    console.error('Error in submitCrimeReport:', error);
    throw error;
  }
}

export async function getCrimeReportsByCountry(countryId: string, limit = 50) {
  try {
    const supabase = await createServerClient();
    
    console.log('🔧 CrimeReports: Supabase client for table insertion:', typeof supabase, supabase);
    
    const { data, error } = await supabase
      .from('crime_reports')
      .select(`
        *,
        user_profiles!crime_reports_created_by_fkey (
          full_name,
          email
        )
      `)
      .eq('country_id', countryId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching crime reports:', error);
      throw new Error(`Failed to fetch reports: ${error.message}`);
    }

    return data;
    
  } catch (error) {
    console.error('Error in getCrimeReportsByCountry:', error);
    throw error;
  }
}

export async function getUserPendingReports(userId: string) {
  try {
    const supabase = await createServerClient();
    
    console.log('🔧 CrimeReports: Fetching pending reports for user:', userId);
    
    const { data, error } = await supabase
      .from('crime_reports')
      .select(`
        *,
        user_profiles!crime_reports_created_by_fkey (
          full_name,
          email
        )
      `)
      .eq('created_by', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user pending reports:', error);
      throw new Error(`Failed to fetch pending reports: ${error.message}`);
    }

    console.log('🔧 CrimeReports: Found pending reports:', data?.length || 0);
    return data;
    
  } catch (error) {
    console.error('Error in getUserPendingReports:', error);
    throw error;
  }
}
