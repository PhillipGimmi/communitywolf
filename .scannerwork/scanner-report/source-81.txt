'use server';

import { createRouteHandler } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { 
  signUpSchema, 
  signInSchema, 
  sanitizeInput 
} from './auth-utils';
import {
  checkUserExists,
  checkRateLimit, 
  recordLoginAttempt
} from './server-utils';

export async function secureSignUpAction(formData: FormData): Promise<{ success: boolean; error?: string; userExists?: boolean; rateLimited?: boolean; redirectTo?: string }> {
  console.log('Starting signup process...');
  
  // Extract and validate form data
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    fullName: formData.get('fullName') as string,
    countryCode: formData.get('countryCode') as string,
  };

  console.log('Raw form data:', { 
    email: rawData.email, 
    fullName: rawData.fullName, 
    countryCode: rawData.countryCode,
    hasPassword: !!rawData.password 
  });

  // Validate input
  const validationResult = signUpSchema.safeParse(rawData);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(e => e.message);
    console.error('Validation errors:', errors);
    throw new Error(errors.join(', '));
  }

  const userData = validationResult.data;
  console.log('Validated user data:', { 
    email: userData.email, 
    fullName: userData.fullName, 
    countryCode: userData.countryCode 
  });

  const supabase = await createRouteHandler();

  // Check if user already exists BEFORE creating auth user
  console.log('Checking if user already exists...');
  const existingUserCheck = await checkUserExists(userData.email);
  
  if (existingUserCheck.exists) {
    console.log('User already exists, returning early');
    return { 
      success: false, 
      error: 'This email is already registered. Please use the Login tab to sign in to your existing account.',
      userExists: true
    };
  }

  // Create user account with email confirmation
  console.log('Creating Supabase auth user...');
  const { data, error } = await supabase.auth.signUp({
    email: userData.email.toLowerCase(),
    password: userData.password,
    options: {
      data: {
        full_name: sanitizeInput(userData.fullName),
        country_code: userData.countryCode,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  });

  if (error) {
    console.error('Supabase auth signup error:', error);
    
    // Handle rate limiting specifically
    if (error.message.includes('24 seconds') || error.message.includes('rate_limit')) {
      return { 
        success: false, 
        error: 'Too many signup attempts. Please wait a moment before trying again.',
        rateLimited: true
      };
    }
    
    // Handle other auth errors
    return { 
      success: false, 
      error: error.message 
    };
  }

  if (!data.user) {
    console.error('No user returned from Supabase auth');
    return { 
      success: false, 
      error: 'Failed to create user account' 
    };
  }

                console.log('Supabase auth user created:', data.user.id);

              // Database trigger will create user profile automatically
              console.log('User profile will be created by database trigger');
  
  // Success - return redirect info
  return { 
    success: true, 
    redirectTo: `/auth/check-email?email=${encodeURIComponent(userData.email)}` 
  };
}

export async function secureSignInAction(formData: FormData): Promise<{ success: boolean; error?: string; redirectTo?: string }> {
  console.log('Starting signin process...');
  
  // Extract and validate form data
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  console.log('Signin attempt for email:', rawData.email);

  // Validate input
  const validationResult = signInSchema.safeParse(rawData);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(e => e.message);
    console.error('Signin validation errors:', errors);
    return { success: false, error: errors.join(', ') };
  }

  const userData = validationResult.data;

  // Check rate limiting
  const rateLimitCheck = checkRateLimit(userData.email);
  if (!rateLimitCheck.allowed) {
    console.log('Rate limit exceeded for:', userData.email);
    return { success: false, error: `Too many login attempts. Please try again in ${rateLimitCheck.remainingTime} seconds.` };
  }

  const supabase = await createRouteHandler();

  // Attempt sign in
  console.log('Attempting Supabase signin...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: userData.email.toLowerCase(),
    password: userData.password,
  });

  if (error) {
    recordLoginAttempt(userData.email, false);
    console.error('Signin error:', error);
    return { success: false, error: error.message };
  }

  if (!data.user) {
    recordLoginAttempt(userData.email, false);
    console.error('No user returned from signin');
    return { success: false, error: 'Login failed' };
  }

  console.log('Signin successful for user:', data.user.id);

  // Success - record successful attempt and return redirect URL
  recordLoginAttempt(userData.email, true);
  revalidatePath('/dashboard');
  return { success: true, redirectTo: '/dashboard' };
}

export async function secureSignOutAction(): Promise<{ success: boolean; redirectTo?: string }> {
  console.log('Starting signout process...');
  
  const supabase = await createRouteHandler();
  await supabase.auth.signOut();
  
  console.log('User signed out successfully');
  
  revalidatePath('/');
  return { success: true, redirectTo: '/' };
}

export async function updateUserProfileAction(
  userId: string,
  updates: {
    full_name?: string;
    phone_number?: string | null;
    preferences?: Record<string, unknown>;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Updating user profile for:', userId);
    
    const supabase = await createRouteHandler();
    
    // Sanitize inputs
    const sanitizedUpdates = {
      ...updates,
      full_name: updates.full_name ? sanitizeInput(updates.full_name) : undefined,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('user_profiles')
      .update(sanitizedUpdates)
      .eq('id', userId);

    if (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    }

    console.log('Profile updated successfully');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Profile update error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function verifyEmailAction(token: string): Promise<{ success: boolean; error?: string; redirectTo?: string }> {
  console.log('Starting email verification...');
  
  const supabase = await createRouteHandler();
  
  const { error } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: 'email',
  });

  if (error) {
    console.error('Email verification error:', error);
    return { success: false, error: error.message };
  }

  console.log('Email verified successfully');

  // Update user profile to verified
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    console.log('Updating user profile verified status...');
    await supabase
      .from('user_profiles')
      .update({ verified: true })
      .eq('id', user.id);
  }

  revalidatePath('/dashboard');
  return { success: true, redirectTo: '/dashboard' };
}