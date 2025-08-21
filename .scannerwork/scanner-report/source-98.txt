export interface SavedLocation {
  id: string;
  user_id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  is_primary: boolean;
  radius_km: number;
  created_at: string;
  updated_at: string;
}

export interface CrimeIncident {
  id: string;
  title: string;
  description?: string;
  incident_type?: string;
  severity_level?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  incident_date?: string;
  reported_date: string;
  source?: string;
  source_url?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCrimeAlert {
  id: string;
  user_id: string;
  incident_id: string;
  location_id?: string;
  distance_km?: number;
  is_read: boolean;
  is_saved: boolean;
  alert_date: string;
  created_at: string;
  incident?: CrimeIncident;
  location?: SavedLocation;
}

export interface CrimeStatistics {
  id: string;
  location_id?: string;
  city?: string;
  state?: string;
  country?: string;
  year: number;
  month: number;
  total_incidents: number;
  violent_crimes: number;
  property_crimes: number;
  other_crimes: number;
  avg_severity?: number;
  created_at: string;
  updated_at: string;
}

export interface UserDashboardPreferences {
  id: string;
  user_id: string;
  default_radius_km: number;
  alert_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  crime_types: string[];
  show_graphs: boolean;
  show_map: boolean;
  show_recent_alerts: boolean;
  theme: 'light' | 'dark' | 'auto';
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalIncidents: number;
  recentIncidents: number;
  averageSeverity: number;
  crimeTrend: 'increasing' | 'decreasing' | 'stable';
  topCrimeTypes: Array<{ type: string; count: number }>;
  monthlyComparison: Array<{ month: string; count: number }>;
}

export interface LocationCrimeSummary {
  location: SavedLocation;
  incidents: CrimeIncident[];
  statistics: CrimeStatistics[];
  recentAlerts: UserCrimeAlert[];
  safetyScore: number; // 1-100
  trend: 'improving' | 'worsening' | 'stable';
}
