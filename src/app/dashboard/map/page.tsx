'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SafetyMap } from '@/components/core/SafetyMap';
import { Navigation } from '@/components/layout/Navigation';
import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { MapPin, Download, RefreshCw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MapPage() {
  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
        <Navigation />
        
        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-sky-800 flex items-center justify-center gap-3">
                <MapPin className="w-8 h-8" />
                Safety Incidents Map
              </h1>
              <p className="text-sky-600 mt-2 max-w-2xl mx-auto">
                View recent safety incidents and crime reports on an interactive map. Get real-time updates and download incident data.
              </p>
            </div>

            <Card className="border-sky-200 shadow-lg">
              <CardHeader className="border-b border-sky-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sky-800">Interactive Safety Map</CardTitle>
                    <CardDescription className="text-sky-600">
                      Explore incidents by location and severity
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-sky-200 text-sky-700 hover:bg-sky-50"
                      onClick={() => window.location.reload()}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-sky-200 text-sky-700 hover:bg-sky-50"
                      onClick={() => window.open('/api/results', '_blank')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download JSON
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <SafetyMap />
              </CardContent>
            </Card>

            <Card className="border-sky-200 shadow-lg">
              <CardHeader className="border-b border-sky-200">
                <CardTitle className="text-sky-800">Map Legend</CardTitle>
                <CardDescription className="text-sky-600">
                  Understand the symbols and colors on the map
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-sky-800 mb-3">Severity Levels</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-red-100 border-2 border-red-200 rounded-full"></div>
                        <span className="text-sm text-slate-700">Critical (4-5) - Violent crimes, serious incidents</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-orange-100 border-2 border-orange-200 rounded-full"></div>
                        <span className="text-sm text-slate-700">High (3) - Property crimes, theft, robbery</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-200 rounded-full"></div>
                        <span className="text-sm text-slate-700">Medium (2) - Vandalism, public order issues</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-100 border-2 border-green-200 rounded-full"></div>
                        <span className="text-sm text-slate-700">Low (1) - Minor incidents, safety alerts</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sky-800 mb-3">Incident Types</h3>
                    <div className="space-y-2 text-sm text-slate-700">
                      <div>
                        <span className="font-bold">Violent Crimes:</span> Assault, robbery, serious offenses
                      </div>
                      <div>
                        <span className="font-bold">Property Crimes:</span> Theft, burglary, vandalism
                      </div>
                      <div>
                        <span className="font-bold">Public Order:</span> Disorder, safety concerns
                      </div>
                      <div>
                        <span className="font-bold">Cyber Crimes:</span> Online fraud, digital offenses
                      </div>
                      <div>
                        <span className="font-bold">Organized Crime:</span> Syndicate operations
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-sky-200 shadow-lg">
              <CardHeader className="border-b border-sky-200">
                <CardTitle className="text-sky-800 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  About the Data
                </CardTitle>
                <CardDescription className="text-sky-600">
                  How incident data is collected and processed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-sky-800 mb-2">Data Sources</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Incident reports are generated from web search results and processed by our AI agents to extract location coordinates and categorize incidents.
                    </p>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>News articles and police reports</li>
                      <li>Community safety alerts</li>
                      <li>Local authority updates</li>
                      <li>Verified incident databases</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sky-800 mb-2">Processing</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Our GeoAgent processes search results to generate structured incident data with accurate coordinates and severity ratings.
                    </p>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>AI-powered location extraction</li>
                      <li>Automatic incident categorization</li>
                      <li>Severity assessment algorithms</li>
                      <li>Real-time data updates</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthWrapper>
  );
}