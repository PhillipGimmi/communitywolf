import { createRouteHandler } from '@/lib/supabase/server';


export async function getUser() {
  const supabase = await createRouteHandler();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch {
    return null;
  }
}

export async function getUserProfile() {
  const user = await getUser();
  
  if (!user) {
    console.log('No user found in getUserProfile');
    return null;
  }

  console.log('Getting profile for user ID:', user.id);
  console.log('User email:', user.email);

  const supabase = await createRouteHandler();
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        role:user_roles(name, level, description),
        country:countries(name, code)
      `)
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return null;
    }

    console.log('Profile fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

export async function requireRole(minLevel: number) {
  const profile = await getUserProfile();
  
  if (!profile || !profile.role || profile.role.level < minLevel) {
    throw new Error('Insufficient permissions');
  }
  
  return profile;
}

export async function requireAdmin() {
  return requireRole(3);
}

export async function requireAuthority() {
  return requireRole(2);
}
