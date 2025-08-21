import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Get query parameters
    const countryId = request.nextUrl.searchParams.get('countryId');
    const userId = request.nextUrl.searchParams.get('userId');
    const limit = request.nextUrl.searchParams.get('limit') || '50';
    
    if (!countryId) {
      return NextResponse.json(
        { error: 'Country ID is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('crime_reports')
      .select(`
        *,
        user_profiles!crime_reports_created_by_fkey (
          full_name,
          email
        )
      `)
      .eq('country_id', countryId);

    // If userId is provided, filter by user
    if (userId) {
      query = query.eq('created_by', userId);
    }

    const { data: reports, error } = await query
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      console.error('❌ Crime Reports API: Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch crime reports' },
        { status: 500 }
      );
    }

    console.log('✅ Crime Reports API: Successfully fetched', reports?.length || 0, 'reports for country', countryId);
    return NextResponse.json(reports || []);
  } catch (error) {
    console.error('❌ Crime Reports API: Error occurred:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crime reports', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
