
// src/lib/agents/simple-geo-agent.ts

import { WebSearchResult } from '@/lib/tools/web-search';
import { promises as fs } from 'fs';
import path from 'path';

export interface IncidentReport {
  datetime: string;
  coordinates: {
    type: string;
    coordinates: [number, number];
  };
  type: string;
  newsID: string;
  severity: number;
  keywords: string[];
  summary: string;
}

export interface GeoAgentRequest {
  readonly query: string;
  readonly searchResults: WebSearchResult[];
}

export interface GeoAgentResponse {
  success: boolean;
  incidentsGenerated: number;
  filePath?: string;
  error?: string;
}

/**
 * GeoAgent - Background processing agent for geolocating safety news
 * 
 * This agent:
 * 1. Takes search results from SearchAgent
 * 2. Uses OpenRouter LLM to extract coordinates and categorize incidents
 * 3. Generates JSON conforming to the required schema
 * 4. Saves to /data/results/{timestamp}.json
 * IMPORTANT: No fallback system - either AI works or we return empty results
 */
export class GeoAgent {
  private readonly openRouterApiKey: string;
  private readonly openRouterBaseUrl: string;
  private readonly dataDir: string;

  constructor() {
    this.openRouterApiKey = process.env.OPENROUTER_API_KEY || '';
    this.openRouterBaseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
    this.dataDir = path.join(process.cwd(), 'data', 'results');
    
    if (!this.openRouterApiKey) {
      console.warn('⚠️ GeoAgent: OpenRouter API key not found. System will not generate incidents.');
    }
  }

  /**
   * Main processing method - generates geolocated JSON
   */
  async process(request: GeoAgentRequest): Promise<GeoAgentResponse> {
    try {
      console.log('🗺️ GeoAgent: Starting processing for query:', request.query);
      console.log('📊 GeoAgent: Processing', request.searchResults.length, 'search results');
      
      // Ensure data directory exists
      await this.ensureDataDirectory();
      
      // Generate incidents using LLM ONLY - no fallbacks
      let incidents: IncidentReport[];
      if (this.openRouterApiKey && request.searchResults.length > 0) {
        incidents = await this.generateIncidentsWithLLM(request.query, request.searchResults);
      } else {
        // No AI processing available - return empty results instead of wrong data
        console.log('⚠️ GeoAgent: No AI processing available, returning empty results');
        incidents = [];
      }
      
      // Save to JSON file (even if empty)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `safety-news-${timestamp}.json`;
      const filePath = path.join(this.dataDir, fileName);
      
      await fs.writeFile(filePath, JSON.stringify(incidents, null, 2));
      
      console.log('✅ GeoAgent: Successfully processed', incidents.length, 'incidents');
      console.log('💾 GeoAgent: Saved to', filePath);
      
      return {
        success: true,
        incidentsGenerated: incidents.length,
        filePath
      };
      
    } catch (error) {
      console.error('❌ GeoAgent: Processing failed:', error);
      return {
        success: false,
        incidentsGenerated: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate incidents using OpenRouter LLM
   */
  private async generateIncidentsWithLLM(query: string, results: WebSearchResult[]): Promise<IncidentReport[]> {
    try {
      const prompt = this.buildIncidentPrompt(query, results);
      
      const response = await fetch(`${this.openRouterBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': 'Safety News App - GeoAgent'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet', // Good for structured output
          messages: [
            {
              role: 'system',
              content: `You are a geolocation expert for safety news. Your task is to:
1. Extract or infer coordinates from news articles
2. Categorize incidents by type
3. Assign severity ratings (1-5)
4. Generate unique news IDs linking to source articles
5. Create concise summaries with source attribution
6. Extract relevant keywords and location details
7. Output valid JSON matching the required schema

IMPORTANT: 
- Return ONLY valid JSON array, no other text
- Include source URLs when available in newsID field
- Focus on recent incidents within the specified time frame
- Ensure coordinates are accurate for the mentioned locations
- If you cannot determine accurate coordinates, do not generate that incident`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      
      if (!content) {
        throw new Error('No content generated by OpenRouter');
      }

      // Parse JSON response
      const incidents = JSON.parse(content) as IncidentReport[];
      
      // Validate and clean incidents
      const validatedIncidents = incidents.map(incident => this.validateIncident(incident));
      
      console.log('🤖 GeoAgent: LLM generated', validatedIncidents.length, 'incidents');
      return validatedIncidents;
      
    } catch (error) {
      console.error('❌ GeoAgent: LLM generation failed:', error);
      // Return empty array instead of fallback incidents
      return [];
    }
  }

  /**
   * Build prompt for LLM incident generation
   */
  private buildIncidentPrompt(query: string, results: WebSearchResult[]): string {
    const resultsText = results.map((result, index) => 
      `${index + 1}. ${result.title}\n   Source: ${result.source}\n   URL: ${result.url}\n   Summary: ${result.snippet}\n`
    ).join('\n');

    return `Query: "${query}"

Based on these search results, generate a JSON array of incident reports. Each incident should have:

- datetime: ISO 8601 timestamp (use current time if not specified)
- coordinates: GeoJSON Point with [longitude, latitude] - infer from location names or use reasonable defaults
- type: One of: "Violent Crimes", "Property & Financial Crimes", "Public Order & Social Crimes", "Cyber & Communication Crimes", "Organised Crime & Syndicate Operations", "Sexual Offences"
- newsID: Unique identifier linking to source (e.g., "news24_robbery_001" or include source URL if available)
- severity: Rating 1-5 (1=low, 5=critical)
- keywords: Array of relevant terms including location names
- summary: ~100 word summary with source attribution

Search Results:
${resultsText}

Generate 2-4 realistic incidents. For coordinates, if location is unclear, do not generate that incident. Only generate incidents where you can reasonably infer the location. Include source URLs in newsID when available. Return ONLY valid JSON array.`;
  }

  /**
   * Validate and clean incident data
   */
  private validateIncident(incident: Partial<IncidentReport>): IncidentReport {
    // Ensure required fields exist
    const validated: IncidentReport = {
      datetime: incident.datetime || new Date().toISOString(),
      coordinates: incident.coordinates || { type: "Point", coordinates: [0, 0] },
      type: incident.type || "Public Order & Social Crimes",
      newsID: incident.newsID || `incident_${Date.now()}`,
      severity: Math.min(Math.max(incident.severity || 2, 1), 5), // Clamp to 1-5
      keywords: Array.isArray(incident.keywords) ? incident.keywords : [],
      summary: incident.summary || "Incident details not available"
    };
    
    // Ensure coordinates are valid
    if (!Array.isArray(validated.coordinates.coordinates) || validated.coordinates.coordinates.length !== 2) {
      validated.coordinates = { type: "Point", coordinates: [0, 0] };
    }
    
    return validated;
  }

  /**
   * Ensure data directory exists
   */
  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
      console.log('📁 GeoAgent: Created data directory:', this.dataDir);
    }
  }

  /**
   * Get severity rating for an incident type
   */
  private getSeverityForType(type: string): number {
    switch (type) {
      case "Violent Crimes":
        return 4;
      case "Property & Financial Crimes":
        return 3;
      case "Public Order & Social Crimes":
        return 2;
      case "Cyber & Communication Crimes":
        return 2;
      case "Organised Crime & Syndicate Operations":
        return 3;
      case "Sexual Offences":
        return 3;
      default:
        return 2; // Default severity
    }
  }
}

