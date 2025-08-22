'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Clock, 
  Filter,
  Search,
  Loader2,
  RefreshCw,
  MapPin,
  Shield,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

import { useAuthStore } from '@/lib/auth/auth-store';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source?: string;
}

interface SearchResponse {
  summary: string;
  results: SearchResult[];
  searchTime: number;
}

type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
type AlertType = 'crime' | 'safety' | 'weather' | 'traffic' | 'emergency';

interface SafetyAlert {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  longDescription?: string;
  severity: SeverityLevel;
  location: string;
  timestamp: string;
  source: string;
  sourceUrl?: string;
  alertType: AlertType;
  isRead: boolean;
  isSaved: boolean;
  distance?: number;
  coordinates?: { lat: number; lng: number };
}

interface SavedLocation {
  id: string;
  user_id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  is_primary: boolean;
  radius_km: number;
  created_at: string;
  updated_at: string;
}

interface CrimeReport {
  id: string;
  type: string;
  severity: string;
  address: string;
  created_at: string;
  latitude?: number;
  longitude?: number;
}

// Helper function to get Badge className based on severity
function getBadgeClassName(severity: SafetyAlert['severity']): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-green-100 text-green-800';
  }
}

export function RecentAlerts() {
  const { userProfile } = useAuthStore();
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
type FilterType = 'all' | 'unread' | 'saved' | 'critical';

  const [filter, setFilter] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Use ref to store fetchAlerts function to avoid circular dependencies
  const fetchAlertsRef = useRef<(() => Promise<void>) | undefined>(undefined);

  console.log('🚨 RecentAlerts: Component rendered with userProfile:', userProfile?.id);

  useEffect(() => {
    console.log('🚨 RecentAlerts: Component mounted with initial state:', {
      userProfileId: userProfile?.id,
      userCountry: userProfile?.country_id,
      savedLocationsCount: savedLocations.length,
      alertsCount: alerts.length
    });
  }, [userProfile?.id, userProfile?.country_id, savedLocations.length, alerts.length]);

  useEffect(() => {
    console.log('🚨 RecentAlerts: State updated:', {
      userProfileId: userProfile?.id,
      userCountry: userProfile?.country_id,
      savedLocationsCount: savedLocations.length,
      alertsCount: alerts.length
    });
  }, [userProfile?.id, userProfile?.country_id, savedLocations.length, alerts.length]);

  // Fetch user's saved locations
  const fetchSavedLocations = useCallback(async () => {
    try {
      if (!userProfile?.id) {
        console.log('⚠️ No user profile ID available for fetching saved locations');
        return;
      }

      console.log('📍 Fetching saved locations for user:', userProfile.id);
      const response = await fetch('/api/location/saved', {
        headers: {
          'x-user-id': userProfile.id
        }
      });
      if (response.ok) {
        const locations = await response.json();
        setSavedLocations(locations);
        console.log('📍 Fetched saved locations:', locations);
        console.log('📍 Primary location:', locations.find((loc: SavedLocation) => loc.is_primary));
        console.log('📍 All locations:', locations.map((loc: SavedLocation) => ({ name: loc.name, address: loc.address, is_primary: loc.is_primary })));
      } else {
        console.error('❌ Failed to fetch saved locations, status:', response.status);
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
      }
    } catch (error) {
      console.error('Failed to fetch saved locations:', error);
    }
  }, [userProfile?.id]);

  const fetchCrimeReports = useCallback(async (): Promise<SafetyAlert[]> => {
    try {
      // Fetch recent crime reports from your database
      const response = await fetch('/api/crime/reports/recent');
      if (response.ok) {
        const reports = await response.json();
        return reports.map((report: CrimeReport) => ({
          id: `crime_${report.id}`,
          title: `${report.type} Incident`,
          description: `Recent ${report.type.toLowerCase()} incident reported in the area.`,
          severity: report.severity as 'low' | 'medium' | 'high' | 'critical',
          location: report.address,
          timestamp: report.created_at,
          source: 'Local Reports',
          alertType: 'crime' as const,
          isRead: false,
          isSaved: false,
          coordinates: report.latitude && report.longitude ? 
            { lat: report.latitude, lng: report.longitude } : undefined
        }));
      }
    } catch (error) {
      console.error('Failed to fetch crime reports:', error);
    }
    return [];
  }, []);

  const fetchSearchBasedAlerts = useCallback(async (): Promise<SafetyAlert[]> => {
    try {
      // Get the user's primary location or first saved location, or default to South Africa
      let locationData = {
        location: 'South Africa',
        radius: 50,
        coordinates: null as { lat: number; lng: number } | null
      };

      console.log('📍 Preparing location data from saved locations:', savedLocations);

      if (savedLocations.length > 0) {
        // Find primary location first, then use first available
        const primaryLocation = savedLocations.find(loc => loc.is_primary);
        const locationToUse = primaryLocation ?? savedLocations[0];
        
        console.log('📍 Selected location to use:', locationToUse);
        
        locationData = {
          location: locationToUse.address,
          radius: locationToUse.radius_km,
          coordinates: locationToUse.latitude && locationToUse.longitude ? 
            { lat: locationToUse.latitude, lng: locationToUse.longitude } : null
        };
        
        console.log('📍 Prepared location data:', locationData);
      } else {
        console.log('📍 No saved locations found, using default South Africa');
      }

      console.log('🚨 Sending to OpenRouter alerts API:', {
        location: locationData.location,
        radius: locationData.radius,
        coordinates: locationData.coordinates,
        userCountry: userProfile?.country_id ?? 'South Africa'
      });

      // Generate intelligent alerts based on user's saved locations
      const requestBody = { 
        location: locationData.location,
        radius: locationData.radius,
        coordinates: locationData.coordinates,
        userCountry: userProfile?.country_id ?? 'South Africa'
      };
      
      console.log('🚨 Request body being sent to /api/alerts/generate:', JSON.stringify(requestBody, null, 2));
      
      console.log('🚨 Making API call to /api/alerts/generate with request body:', requestBody);
      
      const response = await fetch('/api/alerts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      console.log('🚨 API response received:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });
      
      if (response.ok) {
        const generatedAlerts = await response.json();
        console.log('✅ Received alerts from OpenRouter:', generatedAlerts);
        console.log('✅ Response status:', response.status);
        console.log('✅ Response headers:', Object.fromEntries(response.headers.entries()));
        console.log('✅ Parsed alerts array:', generatedAlerts.alerts);
        console.log('✅ Number of alerts returned:', generatedAlerts.alerts?.length ?? 0);
        return generatedAlerts.alerts ?? [];
      } else {
        console.error('❌ Alerts API returned error status:', response.status);
        const errorText = await response.text();
        console.error('❌ Error response body:', errorText);
      }
    } catch (error) {
      console.error('❌ Failed to fetch search-based alerts:', error);
    }
    
    console.log('⚠️ fetchSearchBasedAlerts: Returning empty array (no alerts generated)');
    return [];
  }, [savedLocations, userProfile?.country_id]);

  const fetchWeatherAlerts = useCallback(async (): Promise<SafetyAlert[]> => {
    try {
      // Fetch weather-related safety alerts
      const response = await fetch('/api/alerts/weather');
      if (response.ok) {
        const weatherAlerts = await response.json();
        return weatherAlerts.map((alert: { id: string; title: string; description: string; severity: string; location: string; timestamp: string }) => ({
          id: `weather_${alert.id}`,
          title: alert.title,
          description: alert.description,
          severity: alert.severity as 'low' | 'medium' | 'high' | 'critical',
          location: alert.location,
          timestamp: alert.timestamp,
          source: 'Weather Service',
          alertType: 'weather' as const,
          isRead: false,
          isSaved: false
        }));
      }
    } catch (error) {
      console.error('Failed to fetch weather alerts:', error);
    }
    return [];
  }, []);

  // Combined fetch function
  const fetchAlerts = useCallback(async () => {
    console.log('🚨 fetchAlerts: Starting to fetch alerts with savedLocations:', savedLocations.length);
    
    try {
      setIsLoading(true);
      
      // Fetch all types of alerts
      const [crimeReports, searchAlerts, weatherAlerts] = await Promise.all([
        fetchCrimeReports(),
        fetchSearchBasedAlerts(),
        fetchWeatherAlerts()
      ]);
      
      // Combine and sort alerts by timestamp
      const allAlerts = [...crimeReports, ...searchAlerts, ...weatherAlerts];
      const sortedAlerts = allAlerts.toSorted((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      console.log('🚨 fetchAlerts: Combined and sorted alerts:', sortedAlerts.length);
      setAlerts(sortedAlerts);
      
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCrimeReports, fetchSearchBasedAlerts, fetchWeatherAlerts, savedLocations.length]);

  // Store fetchAlerts function in ref
  useEffect(() => {
    fetchAlertsRef.current = fetchAlerts;
  }, [fetchAlerts]);

  // Fetch saved locations when component mounts
  useEffect(() => {
    if (userProfile?.id) {
      fetchSavedLocations();
    }
  }, [userProfile?.id, fetchSavedLocations]);

  // Fetch alerts when saved locations are available
  useEffect(() => {
    console.log('🚨 useEffect: fetchAlerts triggered with savedLocations.length:', savedLocations.length);
    if (savedLocations.length > 0 && fetchAlertsRef.current) {
      fetchAlertsRef.current();
    }
  }, [savedLocations.length]);

  // Search functionality
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        console.error('Search failed');
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchResultClick = (result: SearchResult) => {
    setAlerts(prev => [...prev, {
      id: `search_${Date.now()}`,
      title: result.title,
      description: result.snippet,
      severity: 'medium',
      location: 'Search Result',
      timestamp: new Date().toISOString(),
      source: result.source ?? 'Search',
      sourceUrl: result.url,
      alertType: 'safety',
      isRead: false,
      isSaved: false
    }]);
    setSearchResults(null);
    setSearchQuery('');
  };

  const toggleAlertExpansion = (alertId: string) => {
    setExpandedAlerts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(alertId)) {
        newSet.delete(alertId);
      } else {
        newSet.add(alertId);
      }
      return newSet;
    });
  };

  // Filter alerts based on current filter
  const filteredAlerts = alerts.filter(alert => {
    switch (filter) {
      case 'unread':
        return !alert.isRead;
      case 'saved':
        return alert.isSaved;
      case 'critical':
        return alert.severity === 'critical';
      default:
        return true;
    }
  });

  // Calculate severity counts
  const severityCounts = alerts.reduce((counts, alert) => {
    counts[alert.severity]++;
    return counts;
  }, { critical: 0, high: 0, medium: 0, low: 0 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading alerts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recent Alerts</h2>
          <p className="text-gray-600">Stay informed about safety in your area</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAlerts}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex items-center space-x-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({alerts.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread ({alerts.filter(a => !a.isRead).length})
            </Button>
            <Button
              variant={filter === 'saved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('saved')}
            >
              Saved ({alerts.filter(a => a.isSaved).length})
            </Button>
            <Button
              variant={filter === 'critical' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('critical')}
            >
              Critical ({severityCounts.critical})
            </Button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex space-x-2">
        <Input
          placeholder="Search alerts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {/* Search Results */}
      {searchResults && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Search Results</h3>
          <div className="space-y-2">
            {searchResults.results.map((result) => (
              <button
                key={`${result.title}-${result.source}`}
                className="w-full p-3 bg-white rounded border cursor-pointer hover:bg-gray-50 text-left"
                onClick={() => handleSearchResultClick(result)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSearchResultClick(result);
                  }
                }}
                aria-label={`Select search result: ${result.title}`}
              >
                <h4 className="font-medium text-gray-900">{result.title}</h4>
                <p className="text-sm text-gray-600">{result.snippet}</p>
                <p className="text-xs text-gray-500 mt-1">Source: {result.source}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
            <p className="text-gray-600">You&apos;re all caught up! No safety alerts for your area at the moment.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                        <Badge 
                          variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                          className={getBadgeClassName(alert.severity)}
                        >
                          {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                        </Badge>
                        {!alert.isRead && (
                          <Badge className="bg-gray-100 text-black text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAlertExpansion(alert.id)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        {expandedAlerts.has(alert.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-600">{alert.description}</p>
                  
                  {/* Location and Time */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{alert.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(alert.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>Source: {alert.source}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Content */}
                  {expandedAlerts.has(alert.id) && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Detailed Information</h4>
                        <p className="text-sm text-gray-700 mb-3">
                          {alert.longDescription ?? alert.description}
                        </p>
                        
                        {/* Source Information */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Source:</span> {alert.source}
                            {alert.sourceUrl && (
                              <span className="ml-2 text-blue-600">
                                (Click &ldquo;View Source&rdquo; to read full article)
                              </span>
                            )}
                          </div>
                          {alert.sourceUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => {
                                window.open(alert.sourceUrl, '_blank', 'noopener,noreferrer');
                              }}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Source
                            </Button>
                          )}
                        </div>
                        
                        {/* Additional Details */}
                        <div className="mt-3 text-xs text-gray-500">
                          <p>Alert ID: {alert.id}</p>
                          <p>Generated: {new Date(alert.timestamp).toLocaleString()}</p>
                          {alert.coordinates && (
                            <p>Coordinates: {alert.coordinates.lat.toFixed(4)}, {alert.coordinates.lng.toFixed(4)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

