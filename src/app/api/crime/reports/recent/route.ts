import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get('countryId');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    console.log('📊 Recent Crime Reports API: Fetching reports for country:', countryId);
    
    const supabase = await createServerClient();
    
    // Get recent crime reports from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    let query = supabase
      .from('crime_reports')
      .select('*')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);
    
    // If countryId is provided, filter by country
    if (countryId) {
      query = query.eq('country_id', countryId);
    }
    
    const { data: reports, error } = await query;
    
    if (error) {
      console.error('❌ Error fetching recent crime reports:', error);
      return NextResponse.json(
        { error: 'Failed to fetch recent crime reports' },
        { status: 500 }
      );
    }
    
    console.log('✅ Recent Crime Reports API: Found', reports?.length ?? 0, 'reports');
    
    return NextResponse.json(reports || []);
    
  } catch (error) {
    console.error('❌ Recent Crime Reports API: Error occurred:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch recent crime reports',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
