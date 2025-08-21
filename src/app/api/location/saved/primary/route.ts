import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Get the user ID from query parameters or headers
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      console.error('❌ Primary Location API: No user ID provided');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Primary Location API: Fetching primary location for user:', userId);

    const { data: location, error } = await supabase
      .from('saved_locations')
      .select(`
        id,
        user_id,
        name,
        address,
        latitude,
        longitude,
        is_primary,
        radius_km,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .eq('is_primary', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('❌ Primary Location API: Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch primary location' },
        { status: 500 }
      );
    }

    if (!location) {
      console.log('ℹ️ Primary Location API: No primary location found for user:', userId);
      return NextResponse.json(null);
    }

    console.log('✅ Primary Location API: Successfully fetched primary location:', {
      userId,
      locationName: location.name,
      address: location.address
    });
    
    return NextResponse.json(location);
  } catch (error) {
    console.error('❌ Primary Location API: Error occurred:', error);
    return NextResponse.json(
      { error: 'Failed to fetch primary location', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
