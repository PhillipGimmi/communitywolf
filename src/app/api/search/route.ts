// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SearchAgent } from '@/lib/agents/search-agent';
import { GeoAgent } from '@/lib/agents/geo-agent';

export async function POST(request: NextRequest) {
  try {
    const { query, location, timeFrame } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }
    
    console.log('🔍 Search API: Received query:', query, 'timeFrame:', timeFrame);
    
    // Step 1: SearchAgent - Immediate response
    const searchAgent = new SearchAgent();
    const searchResponse = await searchAgent.search({ query, location, timeFrame });
    
    // Step 2: Trigger GeoAgent in background (fire and forget)
    const geoAgent = new GeoAgent();
    geoAgent.process({ query, searchResults: searchResponse.results }).catch(error => {
      console.error('❌ GeoAgent background processing failed:', error);
    });
    
    console.log('✅ Search API: Search completed, GeoAgent triggered');
    
    return NextResponse.json({
      success: true,
      summary: searchResponse.summary,
      results: searchResponse.results,
      searchTime: searchResponse.searchTime,
      totalResults: searchResponse.totalResults,
      message: 'Search completed. Background processing started for detailed analysis.'
    });
    
  } catch (error) {
    console.error('❌ Search API: Error occurred:', error);
    
    return NextResponse.json(
      { 
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
