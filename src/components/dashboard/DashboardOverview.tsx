'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  Home, 
  Plus,
  Search,
  BarChart3,
  Map,
  Bell,
  Clock,
  Target
} from 'lucide-react';
import { SavedLocation, DashboardStats } from '@/types/dashboard';
import { useEffect } from 'react';

interface DashboardOverviewProps {
  stats: DashboardStats;
  loading: boolean;
  onTabChange: (tab: string) => void;
  primaryLocation: SavedLocation | null;
}

export function DashboardOverview({ stats, loading, onTabChange, primaryLocation }: DashboardOverviewProps) {

  // Debug logging
  useEffect(() => {
    console.log('🔍 DashboardOverview: Received props:', {
      stats,
      loading,
      primaryLocation: primaryLocation ? {
        name: primaryLocation.name,
        address: primaryLocation.address
      } : null
    });
  }, [stats, loading, primaryLocation]);

  // Quick Actions handlers
  const handleSearchArea = () => {
    // Navigate to search tab with area search focused
    onTabChange('analytics');
  };

  const handleViewMap = () => {
    // Navigate to locations tab
    onTabChange('locations');
  };

  const handleManageAlerts = () => {
    // Navigate to alerts tab
    onTabChange('alerts');
  };

  const handleReportCrime = () => {
    // Navigate to crime reporting form
    onTabChange('report-crime');
  };



  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'decreasing':
        return 'bg-gray-100 text-black';
      case 'increasing':
        return 'bg-gray-100 text-black';
      default:
        return 'bg-gray-100 text-black';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'decreasing':
        return <TrendingUp className="h-4 w-4 text-black" />;
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-black rotate-180" />;
      default:
        return <Target className="h-4 w-4 text-black" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Incidents</p>
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  <p className="text-2xl font-bold text-black">{stats.totalIncidents}</p>
                )}
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent (7 days)</p>
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  <p className="text-2xl font-bold text-black">{stats.recentIncidents}</p>
                )}
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Severity</p>
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  <p className="text-2xl font-bold text-black">{stats.averageSeverity}</p>
                )}
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trend</p>
                <div className="flex items-center space-x-2 mt-1">
                  {getTrendIcon(stats.crimeTrend)}
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
                  ) : (
                    <Badge className={getTrendColor(stats.crimeTrend)}>
                      {stats.crimeTrend}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Primary Location & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary Location */}
        <Card className="border-gray-200 shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Home className="h-5 w-5 text-black" />
              <span>Primary Location</span>
            </CardTitle>
            <CardDescription>
              Your main address for safety monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            {primaryLocation ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-black">{primaryLocation.name}</p>
                    <p className="text-sm text-gray-600">{primaryLocation.address}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Radius: {primaryLocation.radius_km}km</span>
                  <span>Last updated: {new Date(primaryLocation.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-3">No primary location set</p>
                                 <Button 
                   size="sm" 
                   className="bg-black hover:bg-gray-800 text-white"
                   onClick={handleViewMap}
                 >
                   <Plus className="h-4 w-4 mr-2" />
                   Add Location
                 </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start border-black text-black hover:bg-gray-100" 
              size="sm"
              onClick={handleSearchArea}
            >
              <Search className="h-4 w-4 mr-2" />
              Search Area
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-black text-black hover:bg-gray-100" 
              size="sm"
              onClick={handleViewMap}
            >
              <Map className="h-4 w-4 mr-2" />
              View Map
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-black text-black hover:bg-gray-100" 
              size="sm"
              onClick={handleManageAlerts}
            >
              <Bell className="h-4 w-4 mr-2" />
              Manage Alerts
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-black text-black hover:bg-gray-100" 
              size="sm"
              onClick={handleReportCrime}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Report a Crime
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top Crime Types */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Top Crime Types</CardTitle>
          <CardDescription>
            Most common incidents in your monitored areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.topCrimeTypes.length > 0 ? (
            <div className="space-y-3">
              {stats.topCrimeTypes.map((crime, index) => (
                <div key={crime.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-black">
                      {index + 1}
                    </div>
                    <span className="font-medium text-black">{crime.type}</span>
                  </div>
                  <Badge variant="secondary" className="bg-gray-100 text-black">{crime.count} incidents</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No crime data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
