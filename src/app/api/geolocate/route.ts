
// src/app/api/geolocate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GeoAgent } from '@/lib/agents/geo-agent';
import { WebSearchResult } from '@/lib/tools/web-search';

interface GeolocateRequest {
  readonly query: string;
  readonly searchResults: WebSearchResult[];
}

export async function POST(request: NextRequest) {
  try {
    const { query, searchResults }: GeolocateRequest = await request.json();
    
    if (!query || !Array.isArray(searchResults)) {
      return NextResponse.json({ error: 'Invalid query or search results' }, { status: 400 });
    }
    
    console.log('🗺️ GeoAgent API: Processing request for query:', query);
    console.log('📊 GeoAgent API: Processing', searchResults.length, 'search results');
    
    // Initialize GeoAgent
    const geoAgent = new GeoAgent();
    
    const result = await geoAgent.process({ query, searchResults });
    
    if (result.success) {
      console.log('✅ GeoAgent API: Successfully processed', result.incidentsGenerated, 'incidents');
      return NextResponse.json(result);
    } else {
      console.error('❌ GeoAgent API: Processing failed:', result.error);
      return NextResponse.json({ 
        error: 'Geolocation processing failed',
        details: result.error 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ GeoAgent API: Error occurred:', error);
    
    return NextResponse.json({ 
      error: 'Geolocation processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}