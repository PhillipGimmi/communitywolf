import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔍 Countries API: Starting request');
    console.log('🔍 Countries API: Environment variables check:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
    });

    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Countries API: Supabase environment variables not configured');
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      );
    }

    const { id } = await params;
    console.log('🔍 Countries API: Country ID:', id);

    if (!id) {
      console.error('❌ Countries API: No country ID provided');
      return NextResponse.json(
        { error: 'Country ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Countries API: Attempting Supabase query...');
    
    // Fetch country data from Supabase
    const { data: country, error } = await supabase
      .from('countries')
      .select('*')
      .eq('id', id)
      .eq('active', true)
      .single();

    if (error) {
      console.error('❌ Countries API: Supabase query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch country data', details: error.message },
        { status: 500 }
      );
    }

    if (!country) {
      console.error('❌ Countries API: Country not found for ID:', id);
      return NextResponse.json(
        { error: 'Country not found' },
        { status: 404 }
      );
    }

    console.log('✅ Countries API: Successfully fetched country:', country.name);
    return NextResponse.json(country);
  } catch (error) {
    console.error('❌ Countries API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
