'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BarChart3, 
  AlertTriangle,
  Shield,
  Search,
  Loader2,
  Download,
  MapPin,
  Clock
} from 'lucide-react';
import { useCountryFilter } from '@/lib/utils/country-filter';
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
  totalResults: number;
}

// New interface for real crime incidents from Supabase
interface CrimeIncident {
  id: string;
  title: string;
  short_description: string;
  long_description: string | null;
  severity: number;
  location: string;
  area: string | null;
  coordinates: string | null;
  source: string;
  source_url: string | null;
  alert_type: string;
  keywords: string[] | null;
  recommendations: string | null;
  incident_date: string;
  created_at: string;
}

// Analytics data interface
interface AnalyticsData {
  areaStats: Array<{ area: string; incident_count: number }>;
  severityDistribution: Array<{ severity: number; count: number }>;
  alertTypeBreakdown: Array<{ alert_type: string; count: number }>;
  recentIncidents: CrimeIncident[];
  totalIncidents: number;
  averageSeverity: number;
}

export function CrimeAnalytics() {
  const { userCountry } = useCountryFilter();
  const { userProfile } = useAuthStore();

  const [timeRange] = useState<'month' | 'quarter' | 'year'>('month');
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Analytics data
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  
  // New state for real analytics data
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    areaStats: [],
    severityDistribution: [],
    alertTypeBreakdown: [],
    recentIncidents: [],
    totalIncidents: 0,
    averageSeverity: 0
  });

  // Memoize fetchAnalyticsData to fix useEffect dependency warning
  const fetchAnalyticsData = useCallback(async () => {
    if (!userProfile?.id) return;
    
    setIsLoadingAnalytics(true);
    try {
      const response = await fetch('/api/analytics/crime-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userProfile.id,
          timeRange
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
        console.log('✅ Analytics data fetched:', data);
      } else {
        console.error('❌ Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [userProfile?.id, timeRange]);

  useEffect(() => {
    if (userProfile?.id) {
      fetchAnalyticsData();
    }
  }, [userProfile?.id, fetchAnalyticsData]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data: SearchResponse = await response.json();
      setSearchResults(data);
      
      // Trigger background GeoAgent processing for analytics
      triggerGeoAgentProcessing(searchQuery);
      
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const triggerGeoAgentProcessing = async (query: string) => {
    // This would trigger the GeoAgent to process the search results
    // and generate structured incident data
    console.log('🔄 Triggering GeoAgent processing for:', query);
  };

  const fetchLatestResults = async () => {
    await fetchAnalyticsData();
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 4) return 'bg-red-100 text-red-800';
    if (severity >= 3) return 'bg-orange-100 text-orange-800';
    if (severity >= 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getSeverityText = (severity: number) => {
    if (severity >= 4) return 'High';
    if (severity >= 3) return 'Medium';
    if (severity >= 2) return 'Low';
    return 'Very Low';
  };

  const getIncidentTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('violent')) return 'bg-red-200 text-red-800';
    if (lowerType.includes('property')) return 'bg-blue-200 text-blue-800';
    if (lowerType.includes('cyber')) return 'bg-gray-200 text-black';
    if (lowerType.includes('public')) return 'bg-gray-100 text-black';
    return 'bg-gray-100 text-black';
  };

  // Show loading state while country data is loading
  if (!userCountry) {
    return (
      <div className="space-y-6">
        <div className="text-center p-12">
          <p className="text-gray-600">Unable to load country data. Please check your profile settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Crime Analytics</h2>
            <p className="text-gray-600 mt-1">
              Historical analysis and safety insights for your area
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLatestResults}
              disabled={isLoadingAnalytics}
              className="border-gray-200 text-gray-700"
            >
              {isLoadingAnalytics ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Clock className="h-4 w-4 mr-2" />
              )}
              Refresh Data
            </Button>
          </div>
        </div>
      </div>

      {/* NEW: Real Analytics Dashboard */}
      {analyticsData.totalIncidents > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Incidents */}
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Incidents</p>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData.totalIncidents}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          {/* Average Severity */}
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Severity</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {analyticsData.averageSeverity.toFixed(1)}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          {/* Time Range */}
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Time Range</p>
                  <p className="text-3xl font-bold text-gray-900 capitalize">{timeRange}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* NEW: Area Statistics */}
      {analyticsData.areaStats.length > 0 && (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Incidents by Area</CardTitle>
            <CardDescription>
              Distribution of incidents across different areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.areaStats.map((stat) => (
                <div key={`area-${stat.area}`} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{stat.area}</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {stat.incident_count} incidents
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* NEW: Severity Distribution */}
      {analyticsData.severityDistribution.length > 0 && (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Severity Distribution</CardTitle>
            <CardDescription>
              Breakdown of incidents by severity level (1-5 scale)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.severityDistribution.map((stat) => (
                <div key={`severity-${stat.severity}`} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${getSeverityColor(stat.severity)}`}></div>
                    <span className="font-medium text-gray-900">
                      Level {stat.severity} ({getSeverityText(stat.severity)})
                    </span>
                  </div>
                  <Badge className="bg-gray-100 text-gray-800">
                    {stat.count} incidents
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* NEW: Alert Type Breakdown */}
      {analyticsData.alertTypeBreakdown.length > 0 && (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Alert Type Breakdown</CardTitle>
            <CardDescription>
              Distribution of different types of safety alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.alertTypeBreakdown.map((stat) => (
                <div key={`alert-type-${stat.alert_type}`} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${getIncidentTypeColor(stat.alert_type)}`}></div>
                    <span className="font-medium text-gray-900 capitalize">{stat.alert_type}</span>
                  </div>
                  <Badge className="bg-gray-100 text-gray-800">
                    {stat.count} incidents
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* NEW: Recent Incidents from Supabase */}
      {analyticsData.recentIncidents.length > 0 && (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Incidents</CardTitle>
                <CardDescription>
                  Latest safety incidents from your area
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Download JSON functionality
                  const dataStr = JSON.stringify(analyticsData.recentIncidents, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `crime-incidents-${new Date().toISOString().split('T')[0]}.json`;
                  link.click();
                }}
                className="border-gray-200 text-gray-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.recentIncidents.map((incident) => (
                <div key={incident.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">{incident.title}</h4>
                      <Badge className={getSeverityColor(incident.severity)}>
                        {getSeverityText(incident.severity)}
                      </Badge>
                      <Badge className={getIncidentTypeColor(incident.alert_type)}>
                        {incident.alert_type}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{incident.short_description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{incident.area ?? incident.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(incident.incident_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Source: {incident.source}</span>
                      </div>
                    </div>
                    
                    {incident.keywords && incident.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {incident.keywords.map((keyword) => (
                          <Badge key={`${incident.id}-keyword-${keyword}`} variant="outline" className="text-xs border-gray-200 text-gray-600">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Search className="h-5 w-5 mr-2 text-gray-700" />
            Search for Analytics
          </CardTitle>
          <CardDescription>
            Search for safety news to generate analytics and insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
                              placeholder="e.g., Crime trends in Edgemead, Cape Town?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 border-gray-200"
            />
            <Button 
              onClick={handleSearch}
              disabled={isSearching ?? !searchQuery.trim()}
              className="bg-black hover:bg-gray-800 text-white"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
          </div>
          
          {searchError && (
            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-sm text-gray-600">{searchError}</p>
            </div>
          )}
          
          {searchResults && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">Search Summary</h4>
              <p className="text-sm text-gray-600 mb-3">{searchResults.summary}</p>
              <div className="text-xs text-gray-500">
                Found {searchResults.totalResults} results in {searchResults.searchTime}ms
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Empty State */}
      {analyticsData.totalIncidents === 0 && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data</h3>
            <p className="text-gray-600 mb-4">
              No crime incidents have been generated yet. Search for safety news or wait for alerts to be generated.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
