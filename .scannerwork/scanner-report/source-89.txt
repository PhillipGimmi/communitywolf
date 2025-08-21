'use server';

import { createRouteHandler } from './server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signUpAction(formData: FormData): Promise<void> {
  const supabase = await createRouteHandler();
  
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const countryCode = formData.get('countryCode') as string;

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        country_code: countryCode || 'ZA',
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data.user && !data.session) {
    // Email confirmation required
    revalidatePath('/auth/signup');
    redirect('/auth/signup?message=Please check your email to verify your account');
  }

  revalidatePath('/auth/signup');
  redirect('/auth/signup?message=Account created successfully');
}

export async function signInAction(formData: FormData): Promise<void> {
  const supabase = await createRouteHandler();
  
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data.user) {
    revalidatePath('/dashboard');
    redirect('/dashboard');
  }

  throw new Error('Login failed');
}

export async function signOutAction(): Promise<void> {
  const supabase = await createRouteHandler();
  
  await supabase.auth.signOut();
  revalidatePath('/');
  redirect('/');
}

export async function getUserProfile(userId: string) {
  const supabase = await createRouteHandler();
  
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('user_profiles')
      .select(`
        *,
        role:user_roles(name, level, description),
        country:countries(name, code)
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
}

export async function updateProfileAction(
  userId: string, 
  updates: {
    full_name?: string;
    phone_number?: string | null;
    preferences?: Record<string, unknown>;
    verified?: boolean;
    last_seen_at?: string | null;
  }
) {
  const supabase = await createRouteHandler();
  
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('user_profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/dashboard');
    return { success: 'Profile updated successfully' };
  } catch {
    return { error: 'An unexpected error occurred' };
  }
}