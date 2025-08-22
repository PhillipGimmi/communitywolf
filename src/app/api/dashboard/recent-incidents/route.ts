import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandler } from '@/lib/supabase/server';

// Define the incident type to avoid 'any'
interface CrimeIncident {
  id: string;
  title: string;
  short_description: string;
  long_description: string;
  severity: number;
  location: string;
  area: string;
  coordinates: string;
  source: string;
  source_url: string;
  alert_type: string;
  keywords: string[] | null;
  recommendations: string | null;
  incident_date: string | null;
  created_at: string;
}

// Shared utility function to eliminate duplication
function transformIncident(incident: CrimeIncident) {
  return {
    id: incident.id,
    title: incident.title,
    description: incident.short_description,
    incident_type: incident.alert_type,
    severity_level: incident.severity,
    address: incident.location,
    incident_date: incident.incident_date ?? incident.created_at,
    reported_date: incident.created_at,
    verified: true, // crime_incidents are official/verified
    created_at: incident.created_at,
    updated_at: incident.created_at,
    area: incident.area,
    source: incident.source,
    source_url: incident.source_url,
    keywords: incident.keywords ?? [],
    recommendations: incident.recommendations
  };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandler();
    
    // Get the country ID from query parameters (for future use)
    const countryId = request.nextUrl.searchParams.get('countryId');
    const limit = request.nextUrl.searchParams.get('limit') ?? '10';
    
    console.log('🔍 Recent Incidents API: Fetching incidents for country:', countryId);
    
    // Fetch recent crime incidents from crime_incidents table
    const { data: incidents, error } = await supabase
      .from('crime_incidents')
      .select(`
        id, title, short_description, long_description, severity, location, area, coordinates, 
        source, source_url, alert_type, keywords, recommendations, incident_date, created_at
      `)
      .eq('alert_type', 'crime')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      console.error('❌ Recent Incidents API: Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch recent incidents' },
        { status: 500 }
      );
    }

    // If no incidents found, provide fallback data for testing
    if (!incidents || incidents.length === 0) {
      console.log('ℹ️ Recent Incidents API: No incidents found, providing fallback data');
      
      const fallbackIncidents = [
        {
          id: 'fallback-1',
          title: 'Neighborhood Watch Zone 4 Active Surveillance',
          short_description: 'Edgemead Zone 4 Watch continues active neighborhood surveillance program.',
          long_description: 'The Edgemead Zone 4 Watch group maintains an active presence in the community with over 548 members. Their primary mission focuses on crime prevention through neighborhood surveillance and community engagement.',
          severity: 1,
          location: 'Edgemead Zone 4',
          area: 'Edgemead',
          coordinates: '(18.542148,-33.8781535)',
          source: 'Facebook',
          source_url: 'https://www.facebook.com/p/Edgemead-Zone-4-Watch-100064367092696/',
          alert_type: 'safety',
          keywords: ['neighborhood watch', 'community safety', 'surveillance'],
          recommendations: 'Join the local neighborhood watch group and participate in community safety initiatives',
          incident_date: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        {
          id: 'fallback-2',
          title: 'Community Safety Meeting Announcement',
          short_description: 'Public safety meeting scheduled at Edgemead Community Hall.',
          long_description: 'A public safety meeting is scheduled for August 23rd at Edgemead Community Hall, 83 Edgemead Drive. The meeting will run from 08:00-12:00 and operate on a first-come, first-served basis.',
          severity: 1,
          location: '83 Edgemead Drive',
          area: 'Edgemead',
          coordinates: '(18.542148,-33.8781535)',
          source: 'Instagram',
          source_url: 'https://www.instagram.com/p/DL1rhq2MkKN/',
          alert_type: 'safety',
          keywords: ['community meeting', 'public safety', 'municipal'],
          recommendations: 'Attend the community safety meeting and bring required documentation',
          incident_date: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ];

      const transformedFallbackIncidents = fallbackIncidents.map(transformIncident);
      
      console.log('✅ Recent Incidents API: Returning fallback data');
      return NextResponse.json(transformedFallbackIncidents);
    }

    // Transform the data to match the expected format
    const transformedIncidents = incidents?.map(transformIncident) ?? [];
    
    console.log('✅ Recent Incidents API: Successfully fetched', transformedIncidents.length, 'incidents');
    return NextResponse.json(transformedIncidents);
    
  } catch (error) {
    console.error('❌ Recent Incidents API: Error occurred:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch recent incidents', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
