import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

interface GenerateAlertsRequest {
  location: string;
  radius: number;
  coordinates?: { lat: number; lng: number } | null;
  userCountry?: string;
}

interface GeneratedAlert {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  area: string;
  timestamp: string;
  source: string;
  sourceUrl: string;
  alertType: 'crime' | 'safety' | 'weather' | 'traffic' | 'emergency';
  keywords: string[];
  recommendations: string;
  incidentId?: string; // Add this optional field
}

interface RecentReport {
  type: string;
  severity: string;
  address: string;
  created_at: string;
}

interface SearchResult {
  title: string;
  url: string;
  source: string;
  snippet: string;
}

export async function POST(request: NextRequest) {
  console.log('🚀🚀🚀 NEW ALERTS CODE IS RUNNING! 🚀🚀🚀');
  
  try {
    console.log('🚀 ALERTS API: POST request received');
    
    // Check environment variables first
    console.log('🔑 ENV CHECK:', {
      hasOpenRouter: !!process.env.OPENROUTER_API_KEY,
      hasSerpAPI: !!process.env.SERPAPI_KEY,
      serpApiKeyLength: process.env.SERPAPI_KEY?.length || 0,
      nodeEnv: process.env.NODE_ENV
    });
    
    const { location, radius, coordinates, userCountry }: GenerateAlertsRequest = await request.json();
    
    if (!location) {
      console.log('❌ ALERTS API: Location missing from request');
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }
    
    console.log('🤖 Alerts Generation API: Received request:', {
      location,
      radius,
      coordinates,
      userCountry
    });
    
    // Get recent crime data for context
    console.log('📊 ALERTS API: Fetching recent crime reports from Supabase...');
    const supabase = await createServerClient();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: recentReports } = await supabase
      .from('crime_reports')
      .select('type, severity, address, created_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .limit(10);
    
    console.log('📊 ALERTS API: Found', recentReports?.length || 0, 'recent crime reports');
    
    // Generate intelligent alerts using structured outputs
    console.log('🧠 ALERTS API: Starting intelligent alerts generation...');
    const alerts = await generateIntelligentAlertsWithStructuredOutput(
      location, 
      radius, 
      coordinates || null, 
      userCountry, 
      recentReports || [],
      await supabase // Await the supabase client
    );
    
    // Map to frontend format - the frontend expects 'description' field
    const frontendAlerts = alerts.map(alert => ({
      id: alert.id,
      title: alert.title,
      description: alert.shortDescription, // Map shortDescription to description for main display
      shortDescription: alert.shortDescription, // Keep original for reference
      longDescription: alert.longDescription, // Keep original for expanded view
      severity: alert.severity,
      location: alert.location,
      timestamp: alert.timestamp,
      source: alert.source,
      sourceUrl: alert.sourceUrl,
      alertType: alert.alertType,
      isRead: false,
      isSaved: false,
      area: alert.area,
      keywords: alert.keywords,
      recommendations: alert.recommendations
    }));
    
    console.log('✅ Alerts Generation API: Successfully generated', frontendAlerts.length, 'alerts');
    
    return NextResponse.json({ alerts: frontendAlerts });
    
  } catch (error) {
    console.error('❌ Alerts Generation API: Error occurred:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate alerts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function generateIntelligentAlertsWithStructuredOutput(
  location: string, 
  radius: number, 
  coordinates: { lat: number; lng: number } | null,
  userCountry: string | undefined,
  recentReports: RecentReport[],
  supabase: Awaited<ReturnType<typeof createServerClient>> // Fix the type
): Promise<GeneratedAlert[]> {
  console.log('🧠 STEP 0: Starting alerts generation function');
  
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  const serpApiKey = process.env.SERPAPI_KEY;
  
  console.log('🔑 API Keys check:', {
    hasOpenRouter: !!openRouterApiKey,
    hasSerpAPI: !!serpApiKey,
    serpApiKeyLength: serpApiKey?.length || 0
  });
  
  if (!openRouterApiKey) {
    throw new Error('OpenRouter API key not configured. Please set OPENROUTER_API_KEY in your environment variables.');
  }
  
  if (!serpApiKey) {
    throw new Error('SERPAPI_KEY not configured. Please set SERPAPI_KEY in your environment variables.');
  }
  
  try {
    // STEP 1: MUST get Supabase data first - SYNC
    console.log('🔍 STEP 1: Supabase Location Data Check...');
    if (!location || !coordinates) {
      throw new Error('Supabase location data is required. Cannot proceed without location.');
    }
    
    console.log('   ✅ Supabase location confirmed:', location);
    console.log('   ✅ Coordinates confirmed:', coordinates);
    
    // STEP 2: SerpAPI search for crime in that specific location - SYNC
    console.log('🔍 STEP 2: SerpAPI Crime Search Starting...');
    
    const searchQuery = buildDynamicSearchQuery(location);
    console.log('   Dynamic Search Query:', searchQuery);
    
    const searchResults = await performSerpAPISearch(searchQuery);
    
    if (searchResults.length === 0) {
      throw new Error('SerpAPI search returned no results. Cannot proceed to OpenRouter.');
    }
    
    console.log('✅ STEP 2 COMPLETE: SerpAPI Search found', searchResults.length, 'results with URLs');
    
    // Log the actual search results
    searchResults.forEach((result, index) => {
      console.log(`   Result ${index + 1}: ${result.title}`);
      console.log(`     URL: ${result.url}`);
      console.log(`     Source: ${result.source}`);
    });
    
    // STEP 3: OpenRouter LLM processing - SYNC (only after SerpAPI success)
    console.log(' STEP 3: OpenRouter LLM Processing Starting...');
    const context = buildOpenRouterContext(location, radius, coordinates, userCountry, recentReports, searchResults);
    console.log('   Context built, calling OpenRouter API...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://safety-news-app.com',
        'X-Title': 'Safety News App'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: 'You are a safety intelligence analyst. Generate safety alerts using ONLY the provided search results. Return valid JSON only.'
          },
          {
            role: 'user',
            content: context
          }
        ],
        temperature: 0.1,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    
    if (!content) {
      throw new Error('No content generated by OpenRouter');
    }

    console.log('✅ STEP 3 COMPLETE: OpenRouter LLM generated content');
    console.log('🔍 OpenRouter Raw Response:', JSON.stringify(data, null, 2));
    console.log('📝 OpenRouter Generated Content:', content);

    // STEP 4: Parse and validate - SYNC (only after OpenRouter success)
    console.log('🔍 STEP 4: Parsing and Validation Starting...');
    
    // Parse JSON response with better error handling
    let parsedResponse;
    let generatedAlerts: GeneratedAlert[] = [];
    
    try {
      parsedResponse = JSON.parse(content);
      console.log('✅ JSON Parse Success:', JSON.stringify(parsedResponse, null, 2));
      generatedAlerts = parsedResponse.alerts as GeneratedAlert[];
    } catch (parseError) {
      console.error('❌ JSON Parse Failed:', parseError);
      console.error('❌ Raw content that failed to parse:', content);
      
      // Try to extract partial alerts from the content
      console.log('🔄 Attempting to extract partial alerts from incomplete JSON...');
      generatedAlerts = extractPartialAlertsFromContent(content);
      
      if (generatedAlerts.length === 0) {
        throw new Error(`Failed to parse OpenRouter response as JSON: ${parseError}`);
      }
      
      console.log('✅ Extracted', generatedAlerts.length, 'partial alerts from incomplete JSON');
    }
    
    console.log('   Raw alerts from LLM:', generatedAlerts?.length || 0);
    if (generatedAlerts) {
      generatedAlerts.forEach((alert, index) => {
        console.log(`   Alert ${index + 1}:`, {
          id: alert.id,
          title: alert.title,
          shortDescription: alert.shortDescription,
          longDescription: alert.longDescription,
          severity: alert.severity,
          sourceUrl: alert.sourceUrl
        });
      });
    }
    
    // Validate alerts against search results
    const validatedAlerts = validateAlertsAgainstSearchResults(generatedAlerts, searchResults);
    
    console.log('✅ STEP 4 COMPLETE: Validation complete, returning', validatedAlerts.length, 'validated alerts');
    
    // STEP 5: Save to Supabase - NEW FINAL STEP
    console.log('💾 STEP 5: Saving to Supabase Starting...');
    const savedAlerts = await saveAlertsToSupabase(validatedAlerts, coordinates, supabase);
    console.log('✅ STEP 5 COMPLETE: Saved', savedAlerts.length, 'alerts to Supabase');
    
    return validatedAlerts;
    
  } catch (error) {
    console.error('❌ Alerts Generation Error:', error);
    // No more fallback - if it fails, it fails
    throw error;
  }
}

async function performSerpAPISearch(query: string): Promise<SearchResult[]> {
  try {
    const serpApiKey = process.env.SERPAPI_KEY;
    if (!serpApiKey) {
      throw new Error('SERPAPI_KEY not configured');
    }
    
    console.log('   Using SerpAPI for search...');
    console.log('   API Key (first 10 chars):', serpApiKey.substring(0, 10) + '...');
    
    const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${serpApiKey}&num=10`;
    console.log('   SerpAPI URL (without key):', url.replace(serpApiKey, 'HIDDEN_KEY'));
    
    const response = await fetch(url);
    console.log('   SerpAPI Response Status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('   SerpAPI Error Response:', errorText);
      throw new Error(`SerpAPI search failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('   SerpAPI Raw Response Keys:', Object.keys(data));
    
    const results: SearchResult[] = [];
    
    // Add organic results
    if (data.organic_results && Array.isArray(data.organic_results)) {
      console.log('   Found', data.organic_results.length, 'organic results');
      data.organic_results.forEach((result: { title?: string; link?: string; source?: string; snippet?: string }) => {
        if (result.title && result.link) {
          results.push({
            title: result.title,
            url: result.link,
            source: result.source || 'Google Search',
            snippet: result.snippet || result.title
          });
        }
      });
    }
    
    // Add news results if available
    if (data.news_results && Array.isArray(data.news_results)) {
      console.log('   Found', data.news_results.length, 'news results');
      data.news_results.forEach((result: { title?: string; link?: string; source?: string; snippet?: string }) => {
        if (result.title && result.link) {
          results.push({
            title: result.title,
            url: result.link,
            source: result.source || 'News',
            snippet: result.snippet || result.title
          });
        }
      });
    }
    
    console.log('   SerpAPI found', results.length, 'total results');
    return results.slice(0, 10); // Return up to 10 results
    
  } catch (error) {
    console.error('   SerpAPI search error:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

function buildOpenRouterContext(
  location: string, 
  radius: number, 
  coordinates: { lat: number; lng: number } | null,
  userCountry: string | undefined,
  recentReports: RecentReport[],
  searchResults: SearchResult[]
): string {
  const reportSummary = recentReports.length > 0 
    ? `Recent crime reports: ${recentReports.map(r => `${r.type} (${r.severity})`).join(', ')}`
    : 'No recent crime reports in the area.';
  
  const locationInfo = coordinates 
    ? `${location} (${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)})`
    : location;
  
  const searchResultsText = searchResults.length > 0 
    ? searchResults.map((result, index) => 
        `SEARCH RESULT ${index + 1}:
Title: "${result.title}"
URL: ${result.url}
Source: ${result.source}
Content: ${result.snippet}
---`
      ).join('\n\n')
    : 'No search results found.';
  
  return `Location: ${locationInfo} (${radius}km radius)
${userCountry ? `Country: ${userCountry}` : ''}
${reportSummary}

WEB SEARCH RESULTS (use these URLs exactly):
${searchResultsText}

TASK: Generate EXACTLY ${searchResults.length} safety alerts - one for each search result above.

CRITICAL REQUIREMENTS:
- Generate EXACTLY ${searchResults.length} alerts (one per search result)
- Each alert must use one URL from the search results above
- Copy the URL exactly - no modifications
- Base ALL content on the actual search results provided
- Use current timestamp: ${new Date().toISOString()}
- ID format: SA-2025-001, SA-2025-002, etc.

CONTENT REQUIREMENTS:
- title: Create a specific, descriptive title based on the search result
- shortDescription: 1-2 sentence summary of the incident/alert
- longDescription: 3-4 sentence detailed description with context, implications, and specific details from the search result
- area: Extract the specific area/suburb from the search result
- keywords: 3-5 relevant keywords from the content
- recommendations: Specific safety advice based on the incident

Return ONLY valid JSON in this exact format:
{
  "alerts": [
    {
      "id": "SA-2025-001",
      "title": "Specific title based on search result 1",
      "shortDescription": "Brief summary of the incident",
      "longDescription": "Detailed description with context and implications",
      "severity": "low|medium|high|critical",
      "location": "Specific location from search result",
      "area": "Specific area/suburb mentioned",
      "timestamp": "${new Date().toISOString()}",
      "source": "Real news source name",
      "sourceUrl": "Exact URL from search results",
      "alertType": "crime|safety|weather|traffic|emergency",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "recommendations": "Specific safety advice for residents"
    }
    // ... continue for ALL ${searchResults.length} search results
  ]
}`;
}

function buildDynamicSearchQuery(location: string): string {
  // Extract the suburb from the location string
  const parts = location.split(', ');
  
  // Get the suburb (second part after street name)
  const suburb = parts[1]; // "Edgemead" from "Coetzenberg Way, Edgemead, Milnerton, City of Cape Town..."
  
  // Build search query that REQUIRES the suburb name to appear in results
  const searchQuery = `"${suburb}" crime incidents safety news recent today`;
  
  console.log('   Built dynamic query from Supabase data:', searchQuery);
  console.log('   Required suburb keyword:', suburb);
  return searchQuery;
}

function validateAlertsAgainstSearchResults(
  alerts: GeneratedAlert[], 
  searchResults: SearchResult[]
): GeneratedAlert[] {
  const validUrls = new Set(searchResults.map(result => result.url));
  
  return alerts
    .filter(alert => {
      if (!validUrls.has(alert.sourceUrl)) {
        console.warn(`🚨 Removing alert with invalid URL: ${alert.sourceUrl}`);
        return false;
      }
      return true;
    })
    .map(alert => validateAlert(alert));
}

function validateAlert(alert: Partial<GeneratedAlert>): GeneratedAlert {
  const now = new Date().toISOString();
  
  return {
    id: alert.id || `SA-2025-${String(Date.now()).slice(-3)}`,
    title: alert.title || 'No title available',
    shortDescription: alert.shortDescription || 'No short description available',
    longDescription: alert.longDescription || 'No long description available',
    severity: ['low', 'medium', 'high', 'critical'].includes(alert.severity || '') 
      ? (alert.severity as 'low' | 'medium' | 'high' | 'critical') 
      : 'medium',
    location: alert.location || 'Location not specified',
    area: alert.area || alert.location || 'Area not specified',
    timestamp: alert.timestamp || now,
    source: alert.source || 'Source not specified',
    sourceUrl: alert.sourceUrl || 'No URL available',
    alertType: ['crime', 'safety', 'weather', 'traffic', 'emergency'].includes(alert.alertType || '')
      ? (alert.alertType as 'crime' | 'safety' | 'weather' | 'traffic' | 'emergency')
      : 'safety',
    keywords: alert.keywords || [],
    recommendations: alert.recommendations || 'No recommendations available'
  };
}

function extractPartialAlertsFromContent(content: string): GeneratedAlert[] {
  const alerts: GeneratedAlert[] = [];
  const now = new Date().toISOString();
  
  // Find all complete alert objects in the content
  const alertRegex = /"id":\s*"([^"]+)"[^}]*"title":\s*"([^"]+)"[^}]*"shortDescription":\s*"([^"]+)"[^}]*"longDescription":\s*"([^"]+)"[^}]*"severity":\s*"([^"]+)"[^}]*"location":\s*"([^"]+)"[^}]*"area":\s*"([^"]+)"[^}]*"source":\s*"([^"]+)"[^}]*"sourceUrl":\s*"([^"]+)"[^}]*"alertType":\s*"([^"]+)"[^}]*"keywords":\s*\[([^\]]+)\][^}]*"recommendations":\s*"([^"]+)"/g;
  
  let match;
  while ((match = alertRegex.exec(content)) !== null) {
    try {
      const alert: GeneratedAlert = {
        id: match[1],
        title: match[2],
        shortDescription: match[3],
        longDescription: match[4],
        severity: match[5] as 'low' | 'medium' | 'high' | 'critical',
        location: match[6],
        area: match[7],
        timestamp: now, // Assuming timestamp is always present or can be derived
        source: match[8],
        sourceUrl: match[9],
        alertType: match[10] as 'crime' | 'safety' | 'weather' | 'traffic' | 'emergency',
        keywords: match[11].split(',').map(k => k.trim()),
        recommendations: match[12]
      };
      alerts.push(alert);
    } catch (e) {
      console.warn(`Skipping incomplete alert match: ${match[0]}`, e);
    }
  }
  return alerts;
}

async function saveAlertsToSupabase(
  alerts: GeneratedAlert[], 
  coordinates: { lat: number; lng: number } | null,
  supabase: Awaited<ReturnType<typeof createServerClient>>
): Promise<GeneratedAlert[]> {
  const savedAlerts: GeneratedAlert[] = [];
  
  for (const alert of alerts) {
    try {
      // Convert severity from text to numeric (1-5)
      const severityMap: Record<string, number> = {
        'low': 1,
        'medium': 2,
        'high': 4,
        'critical': 5
      };
      
      const numericSeverity = severityMap[alert.severity] || 2;
      
      // Insert into crime_incidents table
      const { data: incident, error: incidentError } = await supabase
        .from('crime_incidents')
        .insert({
          title: alert.title,
          short_description: alert.shortDescription,
          long_description: alert.longDescription,
          severity: numericSeverity,
          location: alert.location,
          area: alert.area,
          coordinates: coordinates ? `(${coordinates.lng}, ${coordinates.lat})` : null,
          source: alert.source,
          source_url: alert.sourceUrl,
          alert_type: alert.alertType,
          keywords: alert.keywords,
          recommendations: alert.recommendations,
          incident_date: alert.timestamp
        })
        .select()
        .single();
      
      if (incidentError) {
        console.error('❌ Failed to insert incident:', incidentError);
        continue;
      }
      
      console.log('✅ Saved incident to crime_incidents:', incident.id);
      // Don't modify the severity field - keep the original text value
      savedAlerts.push({
        ...alert
        // Remove incidentId since it's not in the interface
      });
      
    } catch (error) {
      console.error('❌ Error saving incident:', error);
    }
  }
  
  return savedAlerts;
}