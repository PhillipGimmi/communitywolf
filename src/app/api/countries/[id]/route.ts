import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandler } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/server-auth-context';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Country ID is required' },
        { status: 400 }
      );
    }

    // Get user profile to validate access
    const userProfile = await getUserProfile();
    
    if (!userProfile) {
      console.error('Countries API: No user profile found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate that user is requesting their own country
    if (userProfile.country_id !== id) {
      console.error('Countries API: User attempting to access different country:', {
        userCountryId: userProfile.country_id,
        requestedCountryId: id
      });
      return NextResponse.json(
        { error: 'Access denied - can only access your own country' },
        { status: 403 }
      );
    }

    // Use authenticated client that respects RLS policies
    const supabase = await createRouteHandler();

    // Fetch country data from Supabase with RLS enforcement
    const { data: country, error } = await supabase
      .from('countries')
      .select('*')
      .eq('id', id)
      .eq('active', true)
      .single();

    if (error) {
      console.error('Countries API: Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch country data' },
        { status: 500 }
      );
    }

    if (!country) {
      console.error('Countries API: Country not found:', id);
      return NextResponse.json(
        { error: 'Country not found' },
        { status: 404 }
      );
    }

    console.log('Countries API: Successfully fetched country:', {
      countryId: id,
      countryName: country.name,
      userId: userProfile.id
    });

    return NextResponse.json(country);
  } catch (error) {
    console.error('Countries API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
