import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUser, getUserProfileWithDetails } from '@/lib/auth/server-utils';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Get query parameters
    const countryId = request.nextUrl.searchParams.get('countryId');
    const userId = request.nextUrl.searchParams.get('userId');
    const limit = request.nextUrl.searchParams.get('limit') ?? '50';
    
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

    console.log('✅ Crime Reports API: Successfully fetched', reports?.length ?? 0, 'reports for country', countryId);
    return NextResponse.json(reports ?? []);
  } catch (error) {
    console.error('❌ Crime Reports API: Error occurred:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crime reports', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get user profile to get country_id
    const userProfile = await getUserProfileWithDetails(currentUser.id);
    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const reportData = await request.json();
    
    const supabase = await createServerClient();
    
    console.log('🔧 CrimeReports API: Inserting data:', {
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

    // Try to insert into crime_reports table
    try {
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
        console.error('🔧 CrimeReports API: Error inserting into crime_reports table:', error);
        throw error;
      }

      console.log('🔧 CrimeReports API: Successfully inserted into crime_reports table:', data);
      
      return NextResponse.json({ 
        success: true, 
        data, 
        id: data.id 
      });
      
    } catch (tableError) {
      console.log('🔧 CrimeReports API: Table insertion failed, falling back to user profile:', tableError);
      
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
        console.error('🔧 CrimeReports API: Error storing crime report in profile:', updateError);
        throw new Error(`Failed to store report: ${updateError.message}`);
      }
      
      return NextResponse.json({ 
        success: true, 
        data: { id: crypto.randomUUID() }, 
        storedInProfile: true 
      });
    }
    
  } catch (error) {
    console.error('🔧 CrimeReports API: Error in POST:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
}
