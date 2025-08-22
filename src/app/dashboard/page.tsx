'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { FullPageLoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  MapPin, 
  Shield, 
  AlertTriangle, 
  Plus,
  BarChart3,
  Bell,
  FileText
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth/auth-store';
import { Navigation } from '@/components/layout/Navigation';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { SavedLocations } from '@/components/dashboard/SavedLocations';
import { RecentAlerts } from '@/components/dashboard/RecentAlerts';
import { CrimeAnalytics } from '@/components/dashboard/CrimeAnalytics';
import { CrimeReport } from '@/components/dashboard/CrimeReport';
import { MyReports } from '@/components/dashboard/MyReports';
import { DashboardStats, CrimeIncident, SavedLocation } from '@/types/dashboard';
import { CountryProvider } from '@/contexts/CountryContext';

// Debug logging for CountryProvider import
console.log('🔍 DashboardPage: CountryProvider import:', {
  hasCountryProvider: !!CountryProvider,
  CountryProviderType: typeof CountryProvider
});

export default function DashboardPage() {
  const { userProfile, isAuthenticated, initialized } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 DashboardPage: Auth state changed:', {
      isAuthenticated,
      initialized,
      hasUserProfile: !!userProfile,
      userId: userProfile?.id,
      countryId: userProfile?.country_id,
      fullName: userProfile?.full_name
    });
  }, [isAuthenticated, initialized, userProfile]);

  // Debug logging for CountryProvider rendering
  useEffect(() => {
    console.log('🔍 DashboardPage: CountryProvider wrapper will render');
  }, []);

  // Dashboard data state - moved to parent level
  const [dashboardData, setDashboardData] = useState<{
    stats: DashboardStats;
    recentIncidents: CrimeIncident[];
    loading: boolean;
    error: string | null;
  }>({
    stats: {
      totalIncidents: 0,
      recentIncidents: 0,
      averageSeverity: 0,
      crimeTrend: 'stable',
      topCrimeTypes: [],
      monthlyComparison: []
    },
    recentIncidents: [],
    loading: true,
    error: null
  });

  // Primary location state
  const [primaryLocation, setPrimaryLocation] = useState<SavedLocation | null>(null);

  // Handle URL parameters for tab switching and view modes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      const viewParam = urlParams.get('view');
      
      if (tabParam && ['overview', 'locations', 'alerts', 'analytics', 'report-crime', 'my-reports'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
      
      // Handle view mode for locations tab
      if (tabParam === 'locations' && viewParam === 'map') {
        setActiveTab('locations');
        // We'll need to pass this to the SavedLocations component
      }
    }
  }, []);

  // Shared function to render DashboardOverview to eliminate duplication
  const renderDashboardOverview = useCallback(() => (
    <DashboardOverview 
      stats={dashboardData.stats}
      loading={dashboardData.loading}
      onTabChange={setActiveTab}
      primaryLocation={primaryLocation}
    />
  ), [dashboardData.stats, dashboardData.loading, primaryLocation]);

  // Fetch saved locations function
  const fetchSavedLocations = useCallback(async () => {
    if (!userProfile?.id) {
      console.log('⚠️ Dashboard: No user ID available, skipping location fetch');
      return;
    }
    
    try {
      console.log('🔍 Dashboard: Fetching primary location for user:', userProfile.id);
      
      // Use the API endpoint instead of server action
      const response = await fetch(`/api/location/saved/primary?userId=${userProfile.id}`);
      
      if (response.ok) {
        const primary = await response.json();
        if (primary) {
          console.log('✅ Dashboard: Primary location found:', primary.name);
          setPrimaryLocation(primary);
        } else {
          console.log('ℹ️ Dashboard: No primary location found, setting default');
          // Set a default location based on user's country
          setPrimaryLocation({
            id: 'default-1',
            user_id: userProfile.id,
            name: 'Default Location',
            address: 'Your area',
            latitude: -26.2041, // Default to South Africa
            longitude: 28.0473,
            is_primary: true,
            radius_km: 5,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      } else {
        console.warn('⚠️ Dashboard: Location API failed, setting default location');
        // Set default location on API failure
        setPrimaryLocation({
          id: 'default-1',
          user_id: userProfile.id,
          name: 'Default Location',
          address: 'Your area',
          latitude: -26.2041,
          longitude: 28.0473,
          is_primary: true,
          radius_km: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ Dashboard: Error fetching saved locations:', error);
      // Set default location on error
      setPrimaryLocation({
        id: 'default-1',
        user_id: userProfile.id ?? 'user-1',
        name: 'Default Location',
        address: 'Your area',
        latitude: -26.2041,
        longitude: 28.0473,
        is_primary: true,
        radius_km: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }, [userProfile?.id]);

  // Memoize the location update callback to prevent unnecessary re-renders
  const handleLocationUpdate = useCallback(() => {
    // Refresh primary location when locations are updated
    if (userProfile?.id) {
      fetchSavedLocations();
    }
  }, [userProfile?.id, fetchSavedLocations]);

  useEffect(() => {
    // Wait for auth to initialize, but don't wait forever
    if (initialized) {
      setIsLoading(false);
    }

    // Fallback timeout - if auth takes too long, show dashboard anyway
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('🔧 Dashboard: Auth timeout, showing dashboard anyway');
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [initialized, isLoading]);

  // Fetch dashboard data function
  const fetchDashboardData = useCallback(async () => {
    if (!userProfile?.country_id) {
      console.log('⚠️ Dashboard: No country ID available, skipping data fetch');
      return;
    }
    
    try {
      console.log('🔍 Dashboard: Fetching dashboard data for country:', userProfile.country_id);
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));
      
      // Fetch real data from Supabase via API
      const [statsResponse, incidentsResponse] = await Promise.all([
        fetch(`/api/dashboard/stats?countryId=${userProfile.country_id}`),
        fetch(`/api/dashboard/recent-incidents?countryId=${userProfile.country_id}&limit=5`)
      ]);
      
      console.log('🔍 Dashboard: API responses received:', {
        statsStatus: statsResponse.status,
        incidentsStatus: incidentsResponse.status
      });
      
      if (!statsResponse.ok) {
        const errorText = await statsResponse.text();
        console.error('❌ Dashboard: Stats API error:', statsResponse.status, errorText);
        throw new Error(`Stats API failed: ${statsResponse.status}`);
      }
      
      if (!incidentsResponse.ok) {
        const errorText = await incidentsResponse.text();
        console.error('❌ Dashboard: Incidents API error:', incidentsResponse.status, errorText);
        throw new Error(`Incidents API failed: ${incidentsResponse.status}`);
      }
      
      const stats = await statsResponse.json();
      const recentIncidents = await incidentsResponse.json();
      
      console.log('✅ Dashboard: Successfully fetched data:', {
        stats: stats.totalIncidents,
        incidents: recentIncidents.length,
        statsData: stats,
        incidentsData: recentIncidents
      });
      
      setDashboardData({
        stats,
        recentIncidents,
        loading: false,
        error: null
      });
      
    } catch (error) {
      console.error('❌ Dashboard: Error fetching dashboard data:', error);
      setDashboardData(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch data' 
      }));
    }
  }, [userProfile?.country_id]);

  // Fetch dashboard data once when component mounts and user profile is available
  useEffect(() => {
    console.log('🔍 Dashboard: useEffect for dashboard data triggered:', {
      hasUserProfile: !!userProfile,
      countryId: userProfile?.country_id,
      userId: userProfile?.id
    });
    
    if (userProfile?.country_id) {
      fetchDashboardData();
    }
  }, [userProfile, fetchDashboardData]);

  // Fetch saved locations when user profile is available
  useEffect(() => {
    console.log('🔍 Dashboard: useEffect for saved locations triggered:', {
      hasUserProfile: !!userProfile,
      userId: userProfile?.id
    });
    
    if (userProfile?.id) {
      fetchSavedLocations();
    }
  }, [userProfile, fetchSavedLocations]);

  if (isLoading) {
    return <FullPageLoadingSpinner text="Loading your safety dashboard..." />;
  }

  // Show dashboard even if not authenticated (for testing)
  // In production, you might want to redirect to login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-black mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-black mb-2">Access Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to view your dashboard.</p>
          <Button className="bg-black hover:bg-gray-800 text-white border border-black">
            <a href="/auth/login">Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'report-crime', label: 'Report Crime', icon: AlertTriangle },
    { id: 'my-reports', label: 'Reports', icon: FileText }
  ];

  const renderTabContent = () => {
    // Get current URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');

    switch (activeTab) {
      case 'overview':
        return renderDashboardOverview();
      case 'locations':
        return <SavedLocations 
          key="saved-locations"
          initialViewMode={viewParam === 'map' ? 'map' : 'list'}
          onLocationUpdate={handleLocationUpdate}
        />;
      case 'alerts':
        return <RecentAlerts />;
      case 'analytics':
        return <CrimeAnalytics />;
      case 'report-crime':
        return <CrimeReport />;
      case 'my-reports':
        return <MyReports />;
      default:
        // Default to overview tab
        return renderDashboardOverview();
    }
  };

  return (
    <CountryProvider>
      <div className="min-h-screen bg-white">
        {/* Main Navigation */}
        <Navigation />
        
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-black">
                  Welcome back, {userProfile?.full_name?? 'User'}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Your personalized safety dashboard and crime monitoring
                </p>
                {dashboardData.error && (
                  <p className="text-red-600 text-sm mt-2">
                    ⚠️ {dashboardData.error}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Button variant="outline" size="sm" className="border-black text-black hover:bg-gray-100 text-xs sm:text-sm px-2 sm:px-3">
                  <Bell className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Alerts</span>
                </Button>
                <Button 
                  size="sm" 
                  className="bg-black hover:bg-gray-800 text-white text-xs sm:text-sm px-2 sm:px-3"
                  onClick={() => setActiveTab('locations')}
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Add Location</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
            <div className="flex overflow-x-auto scrollbar-hide space-x-4 sm:space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                      activeTab === tab.id
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs md:text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {renderTabContent()}
        </div>
      </div>
    </CountryProvider>
  );
}
