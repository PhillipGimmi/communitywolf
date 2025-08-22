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
        confidence: result.importance ?? 0.5
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

// Enhanced location extraction from text - SECURE VERSION
export function extractLocationFromText(text: string): string | null {
  // Input validation and length limit to prevent ReDoS
  if (!text || typeof text !== 'string' || text.length > 1000) {
    return null;
  }
  
  // Normalize input
  const normalizedText = text.toLowerCase().trim();
  
  // Simple string-based checks for known locations (fastest and most secure)
  const knownLocations = [
    'johannesburg', 'joburg', 'jozi',
    'cape town', 'capetown',
    'durban', 'ethekwini',
    'pretoria', 'tshwane',
    'bloemfontein',
    'port elizabeth', 'gqeberha',
    // Johannesburg suburbs
    'sandton', 'rosebank', 'parkhurst', 'melville', 'bryanston', 'fourways',
    'hyde park', 'illovo', 'morningside', 'rivonia', 'sunninghill',
    'soweto', 'alexandra', 'randburg', 'roodepoort', 'germiston',
    // Cape Town areas
    'camps bay', 'sea point', 'green point', 'waterfront', 'claremont',
    'stellenbosch', 'paarl', 'bellville', 'parow', 'goodwood'
  ];
  
  // Check for exact matches first (most secure)
  for (const location of knownLocations) {
    if (normalizedText.includes(location)) {
      return location;
    }
  }
  
  // Safe regex patterns - no nested quantifiers or backtracking risks
  const safeLocationPatterns = [
    // Simple "in Location" pattern with bounded length
    { regex: /\bin\s+([a-z]{2,20})\b/i, group: 1 },
    { regex: /\bin\s+([a-z]{2,20}\s[a-z]{2,20})\b/i, group: 1 },
    // Location followed by area/suburb
    { regex: /\b([a-z]{2,20})\s+area\b/i, group: 1 },
    { regex: /\b([a-z]{2,20})\s+suburb\b/i, group: 1 },
    { regex: /\b([a-z]{2,20}\s[a-z]{2,20})\s+area\b/i, group: 1 },
  ];
  
  for (const pattern of safeLocationPatterns) {
    const match = pattern.regex.exec(normalizedText);
    if (match?.[pattern.group]) {
      return match[pattern.group].trim();
    }
  }
  
  return null;
}

// Alternative implementation using string operations (most secure)
export function extractLocationFromTextSecure(text: string): string | null {
  if (!text || typeof text !== 'string' || text.length > 1000) {
    return null;
  }
  
  const normalizedText = text.toLowerCase();
  
  // Known location keywords
  const locationKeywords = [
    'johannesburg', 'joburg', 'jozi', 'cape town', 'capetown',
    'durban', 'pretoria', 'sandton', 'rosebank', 'soweto',
    'camps bay', 'stellenbosch', 'bellville'
  ];
  
  // Find location keywords
  for (const keyword of locationKeywords) {
    if (normalizedText.includes(keyword)) {
      return keyword;
    }
  }
  
  // Look for "in [word]" or "[word] area" patterns using string operations
  const words = normalizedText.split(/\s+/);
  for (let i = 0; i < words.length - 1; i++) {
    if (words[i] === 'in' && words[i + 1].length > 2 && words[i + 1].length < 20) {
      return words[i + 1];
    }
    if (words[i + 1] === 'area' && words[i].length > 2 && words[i].length < 20) {
      return words[i];
    }
  }
  
  return null;
}