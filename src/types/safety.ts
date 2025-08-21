// src/types/safety.ts

// Core Crime Report Types
export interface CrimeReport {
    datetime: string;
    coordinates: {
      type: 'Point';
      coordinates: [number, number]; // [lng, lat]
    };
    type: CrimeType;
    newsID: string;
    severity: number; // 1-5
    keywords: string[];
    summary: string;
  }
  
  export type CrimeType = 
    | 'Violent Crimes'
    | 'Property & Financial Crimes'
    | 'Public Order & Social Crimes'
    | 'Cyber & Communication Crimes'
    | 'Organised Crime & Syndicate Operations'
    | 'Sexual Offences';
  
  // News and Search Types
  export interface NewsItem {
    title: string;
    url: string;
    snippet: string;
    publishedDate: string;
    source: string;
  }
  
  export interface SearchResult {
    summary: string;
    foundItems: NewsItem[];
    timestamp: string;
  }
  
  // Agent Response Types
  export interface GeoAgentResponse {
    processedReports: CrimeReport[];
    timestamp: string;
    processingStats: {
      total: number;
      successful: number;
      failed: number;
    };
  }
  
  export interface SearchAgentResponse {
    summary: string;
    newsItems: NewsItem[];
    toolCalls?: ToolCall[];
  }
  
  // Geocoding Types
  export interface GeocodingResult {
    coordinates: [number, number]; // [lng, lat]
    address: string;
    confidence: number;
  }
  
  export interface LocationInfo {
    location: string | null;
    country?: string;
    confidence: number;
  }
  
  // Tool and Agent Communication Types
  export interface ToolCall {
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }
  
  export interface AgentMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }
  
  // Classification Types
  export interface CrimeClassification {
    type: CrimeType;
    severity: number;
    keywords: string[];
  }
  
  export interface ClassificationParams {
    title: string;
    description: string;
  }
  
  // Search Parameters
  export interface SearchParams {
    query: string;
    location?: string;
    timeframe?: string;
  }
  
  export interface GeocodingParams {
    location: string;
    country?: string;
  }
  
  // Preference Types
  export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    language: string;
    timezone: string;
    mapDefaultZoom: number;
    autoRefresh: boolean;
  }
  
  // Settings Types
  export interface CountrySettings {
    emergencyNumbers: Record<string, string>;
    defaultTimezone: string;
    supportedLanguages: string[];
    mapDefaults: {
      center: [number, number];
      zoom: number;
    };
    dataRetentionDays: number;
  }
  
  // User and Auth Types (for future expansion)
  export interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
    role: UserRole;
    country: Country;
    verified: boolean;
    preferences: UserPreferences;
    created_at: string;
    last_seen_at?: string;
  }
  
  export interface UserRole {
    id: string;
    name: string;
    level: number; // 1=citizen, 2=authority, 3=admin
    description: string;
    permissions: string[];
  }
  
  export interface Country {
    id: string;
    name: string;
    code: string; // ISO country code
    timezone: string;
    currency?: string;
    emergency_number?: string;
    active: boolean;
    settings: CountrySettings;
  }
  
  // API Response Types
  export interface APIResponse<T> {
    data?: T;
    error?: string;
    status: 'success' | 'error';
    timestamp: string;
  }
  
  export interface LatestResultsResponse {
    data: CrimeReport[];
    filename: string;
    count: number;
    generatedAt: string;
  }
  
  export interface LocationResponse {
    city: string;
    country: string;
    countryCode: string;
    state?: string;
    coordinates: [number, number]; // [lng, lat]
  }
  
  // File Storage Types
  export interface StorageResult {
    filename: string;
    path: string;
    size: number;
    timestamp: string;
  }
  
  // Processing Status Types
  export interface ProcessingStep {
    name: string;
    status: 'pending' | 'active' | 'complete' | 'error';
    description: string;
    timestamp?: string;
  }
  
  export interface ProcessingStatus {
    steps: ProcessingStep[];
    currentStep: number;
    isComplete: boolean;
    hasError: boolean;
  }
  
  // Error Types
  export interface ErrorDetails {
    code?: string;
    field?: string;
    value?: string | number | boolean;
    expected?: string;
    received?: string;
    stack?: string;
  }
  
  export interface AppError {
    code: string;
    message: string;
    details?: ErrorDetails;
    timestamp: string;
  }
  
  // Validation Types
  export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }
  
  // Statistics Types
  export interface CrimeStatistics {
    totalReports: number;
    severityBreakdown: Record<number, number>;
    typeBreakdown: Record<CrimeType, number>;
    recentCount: number; // Last 24 hours
    locationCount: number; // Unique locations
    timeRange: {
      earliest: string;
      latest: string;
    };
  }
  
  // Map Types
  export interface MapBounds {
    north: number;
    south: number;
    east: number;
    west: number;
  }
  
  export interface MapMarker {
    id: string;
    coordinates: [number, number];
    type: CrimeType;
    severity: number;
    title: string;
    description: string;
    timestamp: string;
  }
  
  // Component Props Types
  export interface SafetySearchFormProps {
    onSearch: (query: string) => Promise<void>;
    isLoading: boolean;
  }
  
  export interface SearchResultsProps {
    result: SearchResult | null;
    isLoading: boolean;
  }
  
  export interface CrimeMapProps {
    reports: CrimeReport[];
    onMarkerClick?: (report: CrimeReport) => void;
  }
  
  export interface JsonDownloadProps {
    autoRefresh?: boolean;
    refreshInterval?: number;
  }
  
  export interface ProcessingStatusProps {
    isActive: boolean;
    onComplete?: () => void;
  }
  
  // Utility Types
  export type Severity = 1 | 2 | 3 | 4 | 5;
  
  export type SortOrder = 'asc' | 'desc';
  
  export type TimeFrame = 'hour' | 'day' | 'week' | 'month' | 'year';
  
  // Type Guards
  export function isCrimeReport(obj: unknown): obj is CrimeReport {
    if (typeof obj !== 'object' || obj === null) return false;
    
    const report = obj as Record<string, unknown>;
    
    return typeof report.datetime === 'string' &&
      typeof report.coordinates === 'object' &&
      report.coordinates !== null &&
      (report.coordinates as Record<string, unknown>).type === 'Point' &&
      Array.isArray((report.coordinates as Record<string, unknown>).coordinates) &&
      ((report.coordinates as Record<string, unknown>).coordinates as unknown[]).length === 2 &&
      typeof report.type === 'string' &&
      typeof report.newsID === 'string' &&
      typeof report.severity === 'number' &&
      Array.isArray(report.keywords) &&
      typeof report.summary === 'string';
  }
  
  export function isNewsItem(obj: unknown): obj is NewsItem {
    if (typeof obj !== 'object' || obj === null) return false;
    
    const item = obj as Record<string, unknown>;
    
    return typeof item.title === 'string' &&
      typeof item.url === 'string' &&
      typeof item.snippet === 'string' &&
      typeof item.publishedDate === 'string' &&
      typeof item.source === 'string';
  }
  
  export function isValidSeverity(severity: unknown): severity is Severity {
    return typeof severity === 'number' && severity >= 1 && severity <= 5;
  }
  
  export function isValidCrimeType(type: unknown): type is CrimeType {
    const validTypes: CrimeType[] = [
      'Violent Crimes',
      'Property & Financial Crimes',
      'Public Order & Social Crimes',
      'Cyber & Communication Crimes',
      'Organised Crime & Syndicate Operations',
      'Sexual Offences'
    ];
    return typeof type === 'string' && validTypes.includes(type as CrimeType);
  }
  
  // Constants
  export const CRIME_TYPES: Record<CrimeType, string> = {
    'Violent Crimes': 'Violent Crimes',
    'Property & Financial Crimes': 'Property & Financial Crimes',
    'Public Order & Social Crimes': 'Public Order & Social Crimes',
    'Cyber & Communication Crimes': 'Cyber & Communication Crimes',
    'Organised Crime & Syndicate Operations': 'Organised Crime & Syndicate Operations',
    'Sexual Offences': 'Sexual Offences'
  };
  
  export const SEVERITY_LABELS: Record<Severity, string> = {
    1: 'Very Low',
    2: 'Low',
    3: 'Medium',
    4: 'High',
    5: 'Very High'
  };
  
  export const SEVERITY_COLORS: Record<Severity, string> = {
    1: '#22c55e', // Green
    2: '#84cc16', // Light green
    3: '#eab308', // Yellow
    4: '#f97316', // Orange
    5: '#ef4444'  // Red
  };
  
  // Default Values
  export const DEFAULT_COORDINATES: [number, number] = [28.0473, -26.2041]; // Johannesburg
  
  export const DEFAULT_COUNTRY: Country = {
    id: 'south-africa',
    name: 'South Africa',
    code: 'ZA',
    timezone: 'Africa/Johannesburg',
    currency: 'ZAR',
    emergency_number: '10111',
    active: true,
    settings: {
      emergencyNumbers: { 'police': '10111', 'ambulance': '10177', 'fire': '10111' },
      defaultTimezone: 'Africa/Johannesburg',
      supportedLanguages: ['en', 'af', 'zu'],
      mapDefaults: {
        center: [28.0473, -26.2041],
        zoom: 10
      },
      dataRetentionDays: 365
    }
  };