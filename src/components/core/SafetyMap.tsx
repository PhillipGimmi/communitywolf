'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertTriangle, Info } from 'lucide-react';

interface IncidentReport {
  datetime: string;
  coordinates: {
    type: string;
    coordinates: [number, number];
  };
  type: string;
  newsID: string;
  severity: number;
  keywords: string[];
  summary: string;
}

export function SafetyMap() {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const response = await fetch('/api/results');
      if (!response.ok) {
        throw new Error('Failed to fetch incidents');
      }
      const data = await response.json();
      setIncidents(data);
    } catch {
      setError('Failed to load safety data');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 4) return 'bg-red-100 text-red-800 border-red-200';
    if (severity >= 3) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (severity >= 2) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getSeverityLabel = (severity: number) => {
    if (severity >= 4) return 'Critical';
    if (severity >= 3) return 'High';
    if (severity >= 2) return 'Medium';
    return 'Low';
  };

  if (isLoading) {
    return (
      <div className="h-96 bg-slate-100 rounded-lg flex items-center justify-center">
        <div className="text-slate-500">Loading safety data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-96 bg-slate-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <div className="text-red-600">{error}</div>
          <Button 
            onClick={fetchIncidents} 
            variant="outline" 
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Placeholder */}
      <div className="h-96 bg-gradient-to-br from-sky-50 to-blue-100 rounded-lg border-2 border-dashed border-sky-300 flex items-center justify-center relative overflow-hidden">
        {/* Map Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 grid-rows-8 h-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={`grid-cell-${Math.floor(i / 8)}-${i % 8}`} className="border border-sky-200"></div>
            ))}
          </div>
        </div>
        
                 {/* Incident Markers */}
         {incidents.map((incident) => {
           // Convert coordinates to map position (simplified)
           // In a real map, you'd use proper projection
           const [lng, lat] = incident.coordinates.coordinates;
           
           // Simple coordinate to pixel mapping (this is a placeholder)
           // In production, use proper map projection libraries
           const x = 50 + (lng * 100) % 80; // Map to 10-90% of width
           const y = 50 + (lat * 100) % 80; // Map to 10-90% of height
           
           return (
             <div
               key={incident.newsID}
               className="absolute transform -translate-x-1/2 -translate-y-1/2"
               style={{
                 left: `${x}%`,
                 top: `${y}%`
               }}
             >
               <div className="relative group cursor-pointer">
                 <MapPin className="w-6 h-6 text-red-500 drop-shadow-lg" />
                 <Badge 
                   className={`absolute -top-2 -right-2 text-xs ${getSeverityColor(incident.severity)}`}
                 >
                   {incident.severity}
                 </Badge>
                 
                 {/* Tooltip */}
                 <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                   <div className="font-medium">{incident.type}</div>
                   <div className="text-slate-300">{incident.summary.substring(0, 50)}...</div>
                   <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                 </div>
               </div>
             </div>
           );
         })}
        
        {/* Map Info */}
        <div className="text-center z-10">
          <MapPin className="w-12 h-12 text-sky-400 mx-auto mb-2" />
          <div className="text-sky-600 font-medium">Safety Map</div>
          <div className="text-sky-500 text-sm">
            {incidents.length} incidents detected
          </div>
        </div>
      </div>

      {/* Incident List */}
      {incidents.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-800">Recent Incidents</h3>
          {incidents.map((incident) => (
            <Card key={incident.newsID} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-800">{incident.type}</span>
                  </div>
                  <Badge className={getSeverityColor(incident.severity)}>
                    {getSeverityLabel(incident.severity)}
                  </Badge>
                </div>
                
                <p className="text-sm text-slate-600 mb-2">{incident.summary}</p>
                
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{new Date(incident.datetime).toLocaleDateString()}</span>
                  <div className="flex gap-1">
                    {incident.keywords.slice(0, 3).map((keyword) => (
                      <span key={`${incident.newsID}-keyword-${keyword}`} className="px-2 py-1 bg-slate-100 rounded">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {incidents.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <Info className="w-8 h-8 mx-auto mb-2 text-slate-400" />
          <div>No incidents reported in your area</div>
          <div className="text-sm">Your area appears to be safe</div>
        </div>
      )}
    </div>
  );
}
