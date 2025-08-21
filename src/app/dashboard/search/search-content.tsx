'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SafetySearchForm } from '@/components/core/SafetySearchForm';
import { Search, MapPin, AlertTriangle } from 'lucide-react';

export function SearchContent() {
  return (
    <main className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
      <div className="space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Search className="w-8 h-8" />
            Safety News Search
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Search for crime and public safety news in your area. Get immediate answers and detailed incident reports.
          </p>
        </div>

        {/* Search Form Section */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-gray-900">Search Safety News</CardTitle>
            <CardDescription className="text-gray-600">
              Enter your query to find relevant safety information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SafetySearchForm />
          </CardContent>
        </Card>

        {/* Search Tips */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-gray-900">Search Tips</CardTitle>
            <CardDescription className="text-gray-600">
              Get better results with these search strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Be Specific</h3>
                <p className="text-sm text-gray-600">
                  Include location names like &ldquo;Parkhurst, Johannesburg&rdquo; for better results
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Crime Types</h3>
                <p className="text-sm text-gray-600">
                  Mention specific incidents: robbery, theft, assault, vandalism
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Recent Events</h3>
                <p className="text-sm text-gray-600">
                  Ask about recent incidents or ongoing safety concerns
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Example Queries */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-gray-900">Example Queries</CardTitle>
            <CardDescription className="text-gray-600">
              Try these searches to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Location-based</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• &ldquo;Crime in Parkhurst, Johannesburg&rdquo;</li>
                  <li>• &ldquo;Safety news in Cape Town&rdquo;</li>
                  <li>• &ldquo;Recent incidents in London&rdquo;</li>
                </ul>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Incident-specific</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• &ldquo;Robbery reports in my area&rdquo;</li>
                  <li>• &ldquo;Theft incidents this week&rdquo;</li>
                  <li>• &ldquo;Assault cases in downtown&rdquo;</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
