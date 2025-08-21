// src/lib/tools/geocoding.ts
import axios from 'axios';
import { GeocodingResult } from '@/types/safety';

interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
}

export async function geocodeLocation(params: {
  location: string;
  country?: string;
}): Promise<GeocodingResult | null> {
  const { location, country } = params;
  
  console.log('Geocoding: Looking up coordinates for:', location);
  
  try {
    // Build query string
    let query = location;
    if (country) {
      query += `, ${country}`;
    }
    
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        limit: 1,
        addressdetails: 1,
        extratags: 1
      },
      headers: {
        'User-Agent': 'SafetyNewsApp/1.0'
      }
    });

    if (response.data && response.data.length > 0) {
      const result: NominatimResult = response.data[0];
      
      const geocodingResult: GeocodingResult = {
        coordinates: [parseFloat(result.lon), parseFloat(result.lat)],
        address: result.display_name,
        confidence: result.importance || 0.5
      };
      
      console.log('Geocoding: Found coordinates:', geocodingResult.coordinates);
      return geocodingResult;
    }
    
    console.log('Geocoding: No results found for:', location);
    return null;
    
  } catch (error) {
    console.error('Geocoding: Error:', error);
    return null;
  }
}

// Enhanced location extraction from text
export function extractLocationFromText(text: string): string | null {
  // Common South African location patterns
  const locationPatterns = [
    // Cities
    /\b(johannesburg|joburg|jozi)\b/i,
    /\b(cape town|capetown)\b/i,
    /\b(durban|ethekwini)\b/i,
    /\b(pretoria|tshwane)\b/i,
    /\b(bloemfontein)\b/i,
    /\b(port elizabeth|gqeberha)\b/i,
    
    // Johannesburg suburbs
    /\b(sandton|rosebank|parkhurst|melville|bryanston|fourways)\b/i,
    /\b(hyde park|illovo|morningside|rivonia|sunninghill)\b/i,
    /\b(soweto|alexandra|randburg|roodepoort|germiston)\b/i,
    
    // Cape Town areas
    /\b(camps bay|sea point|green point|waterfront|claremont)\b/i,
    /\b(stellenbosch|paarl|bellville|parow|goodwood)\b/i,
    
    // General pattern: "in [Location]" or "[Location] area"
    /\bin\s+([a-z\s]+?)(?:\s+area|\s+suburb|,|\.|$)/i,
    /([a-z\s]+?)\s+(?:area|suburb|shopping centre|mall)/i
  ];
  
  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }
  
  return null;
}

// src/lib/tools/classification.ts
import { CrimeType } from '@/types/safety';

export async function classifyCrime(params: {
  description: string;
  context?: string;
}): Promise<{ type: CrimeType; severity: number; keywords: string[] }> {
  const { description, context } = params;
  const text = `${description} ${context || ''}`.toLowerCase();
  
  console.log('Classification: Analyzing crime type for:', description);
  
  // Extract keywords
  const keywords = extractKeywords(text);
  
  // Classify crime type
  const type = classifyCrimeType(text);
  
  // Assess severity (1-5 scale)
  const severity = assessSeverity(text);
  
  console.log('Classification: Result - Type:', type, 'Severity:', severity, 'Keywords:', keywords);
  
  return { type, severity, keywords };
}

function extractKeywords(text: string): string[] {
  const keywordMap = {
    // Violent crimes
    'murder': ['murder', 'killing', 'homicide', 'shot dead', 'stabbed'],
    'assault': ['assault', 'attack', 'beating', 'violence'],
    'robbery': ['robbery', 'robbed', 'mugging', 'hijacking', 'armed robbery'],
    
    // Property crimes
    'theft': ['theft', 'stolen', 'stealing', 'shoplifting'],
    'burglary': ['burglary', 'break-in', 'breaking and entering', 'housebreaking'],
    'vandalism': ['vandalism', 'damage', 'graffiti'],
    
    // Vehicle crimes
    'vehicle': ['car theft', 'vehicle theft', 'hijacking', 'carjacking'],
    
    // Drug crimes
    'drugs': ['drugs', 'narcotics', 'dealing', 'trafficking', 'possession'],
    
    // Sexual crimes
    'sexual': ['rape', 'sexual assault', 'sexual harassment'],
    
    // Weapons
    'weapons': ['gun', 'firearm', 'knife', 'weapon', 'armed'],
    
    // Locations
    'residential': ['home', 'house', 'residence', 'apartment'],
    'commercial': ['shop', 'store', 'mall', 'business', 'office'],
    'public': ['street', 'park', 'public', 'parking'],
    
    // Time indicators
    'night': ['night', 'evening', 'dark'],
    'day': ['morning', 'afternoon', 'daytime']
  };
  
  const foundKeywords: string[] = [];
  
  Object.entries(keywordMap).forEach(([, terms]) => {
    terms.forEach(term => {
      if (text.includes(term)) {
        foundKeywords.push(term);
      }
    });
  });
  
  return [...new Set(foundKeywords)]; // Remove duplicates
}

function classifyCrimeType(text: string): CrimeType {
  // Violent Crimes
  if (text.match(/murder|killing|homicide|shot|stabbed|assault|attack|violence|robbery|robbed|mugging|hijack/)) {
    return 'Violent Crimes';
  }
  
  // Sexual Offences
  if (text.match(/rape|sexual assault|sexual|harassment/)) {
    return 'Sexual Offences';
  }
  
  // Property & Financial Crimes
  if (text.match(/theft|stolen|burglary|break.*in|fraud|scam|embezzlement|shoplifting/)) {
    return 'Property & Financial Crimes';
  }
  
  // Cyber & Communication Crimes
  if (text.match(/cyber|online|internet|email|phishing|hacking|digital/)) {
    return 'Cyber & Communication Crimes';
  }
  
  // Organised Crime & Syndicate Operations
  if (text.match(/gang|syndicate|organized|trafficking|money laundering|racketeering/)) {
    return 'Organised Crime & Syndicate Operations';
  }
  
  // Public Order & Social Crimes (default)
  return 'Public Order & Social Crimes';
}

function assessSeverity(text: string): number {
  let severity = 1; // Base severity
  
  // High severity indicators
  if (text.match(/murder|killing|death|died|fatal/)) {
    severity = 5;
  } else if (text.match(/shot|stabbed|injured|wounded|armed|gun|weapon/)) {
    severity = 4;
  } else if (text.match(/assault|attack|robbery|hijack/)) {
    severity = 3;
  } else if (text.match(/theft|stolen|break.*in|burglary/)) {
    severity = 2;
  }
  
  // Modifiers
  if (text.match(/multiple|several|gang|group/)) {
    severity = Math.min(5, severity + 1);
  }
  
  if (text.match(/attempted|failed|prevented/)) {
    severity = Math.max(1, severity - 1);
  }
  
  return severity;
}