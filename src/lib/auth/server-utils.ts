import { createRouteHandler } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { sanitizeInput } from './auth-utils';
import type { SignUpData } from './auth-utils';

// Check if user exists by email
export const checkUserExists = async (email: string): Promise<{ exists: boolean; error?: string }> => {
  // Use service role to bypass RLS
  const supabaseService = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  try {
    // Check user_profiles table first
    const { data: existingProfile, error: profileError } = await supabaseService
      .from('user_profiles')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
      return { exists: false, error: profileError.message };
    }

    // If profile exists, user definitely exists
    if (existingProfile) {
      console.log('User exists in profiles:', { email, profileId: existingProfile.id });
      return { exists: true };
    }

    // Also check if there's a pending auth user (not yet confirmed)
    // This prevents duplicate auth user creation
    const { data: pendingAuthUser } = await supabaseService.auth.admin.listUsers();
    const hasPendingUser = pendingAuthUser?.users?.some(user => 
      user.email?.toLowerCase() === email.toLowerCase() && !user.email_confirmed_at
    );

    if (hasPendingUser) {
      console.log('Pending auth user exists:', { email });
      return { exists: true };
    }

    console.log('User does not exist:', { email });
    return { exists: false };
  } catch (error) {
    console.error('Error checking user existence:', error);
    return { exists: false, error: 'An unexpected error occurred' };
  }
};

// User profile management
export const createUserProfile = async (
  userId: string,
  userData: SignUpData
): Promise<{ success: boolean; error?: string; userExists?: boolean }> => {
  // Use service role to bypass RLS for ALL operations
  const supabaseService = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  try {

    // Get country by code with debug logging
    console.log('Country lookup - userData.countryCode:', userData.countryCode);
    console.log('Country lookup - typeof:', typeof userData.countryCode);
    
    const { data: countryData, error: countryError } = await supabaseService
      .from('countries')
      .select('id, timezone, code, active')
      .eq('code', userData.countryCode)
      .eq('active', true)
      .single();

    console.log('Country lookup result:', { countryData, countryError });
    console.log('Full error object:', JSON.stringify(countryError, null, 2));

    if (countryError || !countryData) {
      // Try without active filter to see if country exists but is inactive
      const { data: anyCountry } = await supabaseService
        .from('countries')
        .select('id, timezone, code, active')
        .eq('code', userData.countryCode)
        .single();
      
      console.log('Country without active filter:', anyCountry);
      
      return { success: false, error: `Country lookup failed. Code: "${userData.countryCode}", Error: ${countryError?.message || 'Not found'}` };
    }

    // Check if this is the first user globally (across all countries) = tenant admin
    const { count: totalUserCount, error: countError } = await supabaseService
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    let roleId: string;

    if (countError) {
      return { success: false, error: 'Failed to check user count' };
    }

    if (totalUserCount === 0) {
      // First user ever = admin (tenant owner)
      const { data: adminRole, error: adminError } = await supabaseService
        .from('user_roles')
        .select('id')
        .eq('name', 'admin')
        .single();

      if (adminError || !adminRole) {
        return { success: false, error: 'Failed to get admin role' };
      }
      roleId = adminRole.id;
      console.log('First user - assigned admin role:', roleId);
    } else {
      // All subsequent users = citizen
      const { data: citizenRole, error: citizenError } = await supabaseService
        .from('user_roles')
        .select('id')
        .eq('name', 'citizen')
        .single();

      if (citizenError || !citizenRole) {
        return { success: false, error: 'Failed to get citizen role' };
      }
      roleId = citizenRole.id;
      console.log('Subsequent user - assigned citizen role:', roleId);
    }



         // Create user profile - simple insert, no duplicate checking
     const { error: profileError } = await supabaseService
       .from('user_profiles')
       .insert({
         id: userId,
         email: userData.email.toLowerCase(),
         full_name: sanitizeInput(userData.fullName),
         role_id: roleId,
         country_id: countryData.id,
         verified: false,
         preferences: {
           notifications: true,
           language: 'en',
           timezone: countryData.timezone || 'UTC',
         },
       });

     if (profileError) {
       console.error('Profile creation error:', profileError);
       return { success: false, error: 'Failed to create user profile' };
     }

    return { success: true };
  } catch (error) {
    console.error('Profile creation error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const getUserProfileWithDetails = async (userId: string) => {
  const supabase = await createRouteHandler();
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        role:user_roles(name, level, description, permissions),
        country:countries(name, code, timezone, emergency_number)
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<Database['public']['Tables']['user_profiles']['Update']>
) => {
  const supabase = await createRouteHandler();
  
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Profile update error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// Session management
export const getCurrentSession = async () => {
  const supabase = await createRouteHandler();
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
};

export const getCurrentUser = async () => {
  const session = await getCurrentSession();
  return session?.user ?? null;
};

// Rate limiting (simple in-memory for now)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export const checkRateLimit = (email: string): { allowed: boolean; remainingTime?: number } => {
  const now = Date.now();
  const attempts = loginAttempts.get(email);
  
  if (!attempts) {
    return { allowed: true };
  }

  // Reset after 15 minutes
  if (now - attempts.lastAttempt > 15 * 60 * 1000) {
    loginAttempts.delete(email);
    return { allowed: true };
  }

  // Allow max 5 attempts per 15 minutes
  if (attempts.count >= 5) {
    const remainingTime = Math.ceil((15 * 60 * 1000 - (now - attempts.lastAttempt)) / 1000);
    return { allowed: false, remainingTime };
  }

  return { allowed: true };
};

export const recordLoginAttempt = (email: string, success: boolean) => {
  const now = Date.now();
  const attempts = loginAttempts.get(email) || { count: 0, lastAttempt: now };
  
  if (success) {
    loginAttempts.delete(email);
  } else {
    attempts.count++;
    attempts.lastAttempt = now;
    loginAttempts.set(email, attempts);
  }
};