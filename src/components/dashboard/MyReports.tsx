'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth/auth-store';
import { Clock, MapPin, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface CrimeReport {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  summary: string;
  description: string;
  address: string;
  datetime: string;
  status: 'pending' | 'verified' | 'investigating' | 'resolved' | 'false_alarm';
  created_at: string;
  user_profiles: {
    full_name: string;
    email: string;
  };
}

export function MyReports() {
  const { userProfile } = useAuthStore();
  const [allReports, setAllReports] = useState<CrimeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllReports = async () => {
      if (!userProfile?.country_id || !userProfile?.id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/crime/reports?countryId=${userProfile.country_id}&userId=${userProfile.id}&limit=100`);
        if (response.ok) {
          const reports = await response.json();
          setAllReports(reports ?? []);
        } else {
          throw new Error('Failed to fetch reports');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };

    fetchAllReports();
  }, [userProfile?.country_id, userProfile?.id]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-gray-200 text-gray-800';
      case 'high': return 'bg-gray-300 text-gray-800';
      case 'critical': return 'bg-gray-400 text-white';
      case 'emergency': return 'bg-black text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-gray-600" />;
      case 'verified': return <CheckCircle className="h-4 w-4 text-gray-700" />;
      case 'investigating': return <AlertTriangle className="h-4 w-4 text-gray-700" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-gray-700" />;
      case 'false_alarm': return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Reports</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Role Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
                         <h2 className="text-2xl font-bold text-gray-900">Crime Reports</h2>
             <p className="text-gray-600 mt-1">
               All crime reports in your country
             </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Your Role</div>
            <Badge variant="outline" className="text-sm">
              {userProfile?.role?.name ?? 'citizen'}
            </Badge>
            <div className="text-xs text-gray-400 mt-1">
              Level {userProfile?.role?.level ?? 1}
            </div>
          </div>
        </div>
      </div>

      {/* Reports Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-gray-600 mr-3" />
                             <div>
                 <div className="text-2xl font-bold text-gray-900">{allReports.filter(r => r.status === 'pending').length}</div>
                 <div className="text-sm text-gray-600">Pending Reports</div>
               </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-gray-700 mr-3" />
              <div>
                                 <div className="text-2xl font-bold text-gray-900">
                   {allReports.filter(r => r.status === 'verified').length}
                 </div>
                <div className="text-sm text-gray-600">Verified Reports</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-gray-700 mr-3" />
              <div>
                                 <div className="text-2xl font-bold text-gray-900">
                   {allReports.filter(r => r.status === 'investigating').length}
                 </div>
                <div className="text-sm text-gray-600">Under Investigation</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

             {/* Reports List */}
       {allReports.length === 0 ? (
         <Card>
           <CardContent className="p-8 text-center">
             <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
             <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Yet</h3>
             <p className="text-gray-600 mb-4">
                               No crime reports have been submitted in your country yet. Use the &ldquo;Report Crime&rdquo; tab to submit the first report.
             </p>
             <Button 
               onClick={() => window.location.href = '/dashboard?tab=report-crime'}
               className="bg-black hover:bg-gray-800 text-white"
             >
               Report a Crime
             </Button>
           </CardContent>
         </Card>
       ) : (
         <div className="space-y-4">
           <h3 className="text-lg font-semibold text-gray-900">All Reports</h3>
           {allReports.map((report) => (
                         <Card key={report.id} className="border-l-4 border-l-gray-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">{report.summary}</h4>
                      <Badge className={getSeverityColor(report.severity)}>
                        {report.severity}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        {getStatusIcon(report.status)}
                        <span className="capitalize">{report.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{report.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-600" />
                        <span>{report.address ?? 'No address provided'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-600" />
                        <span>Reported: {formatDate(report.datetime)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-gray-500">
                    <div>Type: {report.type}</div>
                    <div>Created: {formatDate(report.created_at)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Role Information */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">About Your Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <strong>Current Role:</strong> {userProfile?.role?.name ?? 'citizen'}
            </div>
            <div>
              <strong>Level:</strong> {userProfile?.role?.level ?? 1}
            </div>
            <div>
              <strong>Description:</strong> {userProfile?.role?.description ?? 'Regular community member with basic reporting and viewing capabilities'}
            </div>
            <div className="pt-2">
              <p className="text-sm text-gray-600">
                                 As a {userProfile?.role?.name ?? 'citizen'}, you can create crime reports that will be reviewed by authorities. 
                 Your reports start with &ldquo;pending&rdquo; status and will be verified by users with higher permissions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
