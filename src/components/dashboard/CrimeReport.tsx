'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 

  Map,
  Navigation,
  Save,
  X,
  CalendarIcon,
} from 'lucide-react';
import { AddressLookup } from '@/components/ui/address-lookup';
import { useCountryFilter } from '@/lib/utils/country-filter';
import dynamic from 'next/dynamic';
import { submitCrimeReport } from '@/lib/supabase/crime-reports';

// Dynamically import the map component to avoid SSR issues
const CrimeReportMap = dynamic(() => import('./CrimeReportMap').then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
        <p className="text-gray-500">Loading map...</p>
      </div>
    </div>
  ),
});

interface CrimeReportData {
  readonly incident_type: string;
  readonly severity_level: number;
  readonly title: string;
  readonly description: string;
  readonly address: string;
  readonly coordinates?: { lat: number; lng: number };
  readonly radius_km: number;
  readonly incident_date: string;
  readonly incident_time: string;
  readonly reported_by: string;
}

const CRIME_TYPES = [
  'theft', 'robbery', 'assault', 'burglary', 'vandalism', 
  'drug_related', 'domestic_violence', 'fraud', 'cybercrime', 
  'hate_crime', 'vehicle_theft', 'arson', 'kidnapping', 'other'
];

const SEVERITY_LEVELS = [
  { value: 1, label: 'Low - Minor incident', color: 'bg-gray-100 text-gray-800' },
  { value: 2, label: 'Medium - Moderate concern', color: 'bg-gray-200 text-gray-800' },
  { value: 3, label: 'High - Serious incident', color: 'bg-gray-300 text-gray-800' },
  { value: 4, label: 'Critical - Very serious', color: 'bg-gray-400 text-white' },
  { value: 5, label: 'Emergency - Immediate danger', color: 'bg-black text-white' }
];

// Shared utility function to eliminate duplication
const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function CrimeReport() {
  const { userCountry } = useCountryFilter();
  const [reportData, setReportData] = useState<CrimeReportData>({
    incident_type: '',
    severity_level: 1,
    title: '',
    description: '',
    address: '',
    coordinates: undefined,
    radius_km: 1.0,
    incident_date: formatDateForInput(new Date()),
    incident_time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    reported_by: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    // Set reported_by from user profile when available
    if (userCountry) {
      setReportData(prev => ({
        ...prev,
        reported_by: `User in ${userCountry.name}`
      }));
    }
    console.log('🔧 CrimeReport: Component mounted, userCountry:', userCountry);
  }, [userCountry]);

  const handleAddressSelect = (address: { display_name: string; lat: string; lon: string }) => {
    console.log('🔧 CrimeReport: Address selected from dropdown:', address);
    
    const coordinates = {
      lat: parseFloat(address.lat),
      lng: parseFloat(address.lon)
    };
    
    // Update both the form data and map coordinates
    setReportData(prev => ({
      ...prev,
      address: address.display_name,
      coordinates
    }));
    setMapCoordinates(coordinates);
    
    console.log('🔧 CrimeReport: Updated coordinates and address:', coordinates, address.display_name);
  };

  const handleMapClick = (coordinates: { lat: number; lng: number }, address?: string) => {
    console.log('🔧 CrimeReport: Map click received:', coordinates, 'with address:', address);
    
    // Update map coordinates
    setMapCoordinates(coordinates);
    
    // Update form data with coordinates and address (if available)
    setReportData(prev => ({
      ...prev,
      coordinates,
      address: address ?? prev.address
    }));
    
    console.log('🔧 CrimeReport: Updated form with coordinates:', coordinates, 'and address:', address);
  };

  const mapSeverityLevel = (level: number): 'low' | 'medium' | 'high' | 'critical' | 'emergency' => {
    switch (level) {
      case 1: return 'low';
      case 2: return 'medium';
      case 3: return 'high';
      case 4: return 'critical';
      default: return 'emergency';
    }
  };

  const resetForm = () => {
    setReportData({
      incident_type: '',
      severity_level: 1,
      title: '',
      description: '',
      address: '',
      coordinates: undefined,
      radius_km: 1.0,
      incident_date: formatDateForInput(new Date()),
      incident_time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      reported_by: `User in ${userCountry?.name?? 'Unknown'}`
    });
    setMapCoordinates(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!reportData.incident_type || !reportData.title || !reportData.address) {
      alert('Please fill in all required fields');
      return;
    }
    // Validate that either address or coordinates are provided
    if (!reportData.address.trim() && !reportData.coordinates) {
      alert('Please provide either an address or select a location on the map');
      return;
    }
    setIsSubmitting(true);
    try {
      console.log('🔧 CrimeReport: Submitting crime report:', reportData);
      
      // Prepare the data for submission
      const submissionData = {
        type: reportData.incident_type,
        severity: mapSeverityLevel(reportData.severity_level),
        summary: reportData.title,
        description: reportData.description,
        address: reportData.address,
        datetime: `${reportData.incident_date}T${reportData.incident_time}:00`,
        coordinates: reportData.coordinates,
        radius_km: reportData.radius_km,
        keywords: [reportData.incident_type, reportData.severity_level.toString()]
      };
      console.log('🔧 CrimeReport: Submitting to database:', submissionData);
      
      // Submit to database
      const result = await submitCrimeReport(submissionData);
      
      console.log('🔧 CrimeReport: Database submission result:', result);
      
      if (result.success) {
        setSubmitSuccess(true);
        setSubmitError(null);
        
        // Reset form
        resetForm();
        
        console.log('🔧 CrimeReport: Form reset successfully');
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        throw new Error('Submission failed');
      }
       
     } catch (error) {
       console.error('🔧 CrimeReport: Error submitting report:', error);
       setSubmitError(error instanceof Error ? error.message : 'Unknown error occurred');
       setSubmitSuccess(false);
     } finally {
       setIsSubmitting(false);
     }
   };

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black">Report a Crime</h2>
          <p className="text-gray-600">Help keep your community safe by reporting incidents in {userCountry.name}</p>
        </div>

      </div>
             {/* Success/Error Messages */}
       {submitSuccess && (
         <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
           <div className="flex items-center">
             <div className="flex-shrink-0">
               <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                 <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                 </svg>
               </div>
             </div>
             <div className="ml-3">
               <p className="text-sm font-medium text-gray-800">
                 Crime report submitted successfully! Thank you for helping keep your community safe.
               </p>
             </div>
             <div className="ml-auto pl-3">
               <button
                 type="button"
                 onClick={() => setSubmitSuccess(false)}
                 className="text-gray-400 hover:text-gray-600"
               >
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                 </svg>
               </button>
             </div>
           </div>
         </div>
       )}
       {submitError && (
         <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
           <div className="flex items-center">
             <div className="flex-shrink-0">
               <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                 <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                 </svg>
               </div>
             </div>
             <div className="ml-3">
               <p className="text-sm font-medium text-gray-800">
                 Failed to submit report: {submitError}
               </p>
             </div>
             <div className="ml-auto pl-3">
               <button
                 type="button"
                 onClick={() => setSubmitError(null)}
                 className="text-gray-400 hover:text-gray-600"
               >
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                 </svg>
               </button>
             </div>
           </div>
         </div>
       )}
       <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
         {/* Crime Details */}
         <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Incident Details</CardTitle>
            <CardDescription className="text-sm">Provide information about what happened</CardDescription>
          </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3">
                <Label htmlFor="incident_type" className="text-sm font-medium text-gray-700">Type of Incident *</Label>
                <Select 
                  value={reportData.incident_type} 
                  onValueChange={(value) => setReportData(prev => ({ ...prev, incident_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select incident type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CRIME_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="severity_level" className="text-sm font-medium text-gray-700">Severity Level *</Label>
                <Select 
                  value={reportData.severity_level.toString()} 
                  onValueChange={(value) => setReportData(prev => ({ ...prev, severity_level: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value.toString()}>
                        <div className="flex items-center space-x-2">
                          <Badge className={level.color}>{level.value}</Badge>
                          <span>{level.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">Brief Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Car break-in on Main Street"
                value={reportData.title}
                onChange={(e) => setReportData(prev => ({ ...prev, title: e.target.value }))}
                maxLength={100}
                className="h-10 sm:h-11 text-sm"
              />
            </div>
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">Detailed Description</Label>
              <Textarea
                id="description"
                placeholder="Provide as many details as possible about what happened, when, and any suspects or vehicles involved..."
                value={reportData.description}
                onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                maxLength={1000}
                className="resize-none text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="incident_date" className="text-sm font-medium text-gray-700">Date of Incident *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-gray-200 h-10 sm:h-11 text-sm"
                    >
                                             <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-gray-800" />
                      {reportData.incident_date ? (
                        new Date(reportData.incident_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      ) : (
                        <span className="text-gray-500">Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={reportData.incident_date ? new Date(reportData.incident_date) : undefined}
                                             onSelect={(date) => {
                        if (date) {
                          setReportData(prev => ({
                            ...prev,
                            incident_date: formatDateForInput(date)
                          }));
                        }
                      }}
                      disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="incident_time" className="text-sm font-medium text-gray-700">Time of Incident</Label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <Select 
                    value={reportData.incident_time.split(':')[0]} 
                    onValueChange={(hour) => {
                      const currentTime = reportData.incident_time.split(':');
                      const newTime = `${hour}:${currentTime[1]}`;
                      setReportData(prev => ({ ...prev, incident_time: newTime }));
                    }}
                  >
                    <SelectTrigger className="h-10 sm:h-11 text-sm">
                      <SelectValue placeholder="Hour" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={`hour-${i.toString().padStart(2, '0')}`} value={i.toString().padStart(2, '0')}>
                          {i.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select 
                    value={reportData.incident_time.split(':')[1]} 
                    onValueChange={(minute) => {
                      const currentTime = reportData.incident_time.split(':');
                      const newTime = `${currentTime[0]}:${minute}`;
                      setReportData(prev => ({ ...prev, incident_time: newTime }));
                    }}
                  >
                    <SelectTrigger className="h-10 sm:h-11 text-sm">
                      <SelectValue placeholder="Minute" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 60 }, (_, i) => (
                        <SelectItem key={`minute-${i.toString().padStart(2, '0')}`} value={i.toString().padStart(2, '0')}>
                          {i.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Location Selection */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Location Details</CardTitle>
            <CardDescription className="text-sm">Where did this incident occur?</CardDescription>
          </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address *</Label>
              <AddressLookup
                onAddressSelect={handleAddressSelect}
                placeholder="Search for the incident location..."
                value={reportData.address}
                onChange={(value) => setReportData(prev => ({ ...prev, address: value }))}
              />
            </div>
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="radius" className="text-sm font-medium text-gray-700">Radius (km) *</Label>
              <Select 
                value={reportData.radius_km.toString()} 
                onValueChange={(value) => setReportData(prev => ({ ...prev, radius_km: parseFloat(value) }))}
              >
                <SelectTrigger className="h-10 sm:h-11 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5 km</SelectItem>
                  <SelectItem value="1.0">1.0 km</SelectItem>
                  <SelectItem value="2.0">2.0 km</SelectItem>
                  <SelectItem value="5.0">5.0 km</SelectItem>
                  <SelectItem value="10.0">10.0 km</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs sm:text-sm text-gray-500">Select the radius around the incident location</p>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    console.log('🔧 CrimeReport: Map button clicked, setting showMap to true');
                    console.log('🔧 CrimeReport: Current address:', reportData.address);
                    console.log('🔧 CrimeReport: Current coordinates:', reportData.coordinates);
                    setShowMap(true);
                  }}
                  className="border-black text-black hover:bg-gray-100 h-10 sm:h-11 px-4 sm:px-6 text-sm w-full sm:w-auto"
                >
                                     <Map className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-800" />
                   Select on Map
                </Button>
                {mapCoordinates && (
                                     <Badge variant="secondary" className="bg-gray-100 text-gray-800 text-xs">
                     <Navigation className="h-3 w-3 mr-1 text-gray-800" />
                     Location Selected: {mapCoordinates.lat.toFixed(4)}, {mapCoordinates.lng.toFixed(4)}
                   </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
                 {/* Submit Section */}
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 pt-4 sm:pt-6">
           <div className="text-xs sm:text-sm text-gray-600 space-y-1">
             <p>• All reports are reviewed by local authorities</p>
             <p>• Your personal information is protected</p>
             <p>• False reports may result in legal consequences</p>
           </div>
           <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                         <Button
               type="button"
               variant="outline"
                              onClick={() => {
                  resetForm();
               }}
               className="border-black text-black hover:bg-gray-100 h-10 sm:h-11 px-4 sm:px-6 text-sm w-full sm:w-auto"
             >
                               <X className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-800" />
                Clear Form
             </Button>
                          <Button
               type="submit"
               disabled={isSubmitting || !reportData.incident_type || !reportData.title || !reportData.address}
               className="bg-black hover:bg-gray-800 text-white h-10 sm:h-11 px-6 sm:px-8 text-sm w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isSubmitting ? (
                 <>
                   <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                   Submitting Report...
                 </>
               ) : (
                 <>
                   <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-white" />
                   Submit Report
                 </>
               )}
             </Button>
          </div>
        </div>
      </form>
      {/* Full Screen Map Drawer */}
      {showMap && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
            {/* Map Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border-b border-gray-200 space-y-3 sm:space-y-0">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-black">Select Incident Location</h3>
                <p className="text-xs sm:text-sm text-gray-600">Click on the map to select the exact location where the incident occurred</p>
              </div>
                           <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
               {mapCoordinates && (
                 <>
                   <Badge variant="secondary" className="bg-gray-100 text-gray-800 text-xs">
                     <Navigation className="h-3 w-3 mr-1 text-gray-800" />
                     {mapCoordinates.lat.toFixed(4)}, {mapCoordinates.lng.toFixed(4)}
                   </Badge>
                   <Badge variant="secondary" className="bg-gray-200 text-gray-800 text-xs">
                     Radius: {reportData.radius_km} km
                   </Badge>
                 </>
               )}
               <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMap(false)}
                  className="border-black text-black hover:bg-gray-100 text-sm w-full sm:w-auto"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Close
                </Button>
              </div>
            </div>
            {/* Map Container */}
            <div className="flex-1 relative">
                                                                                        <CrimeReportMap
                 onMapClick={handleMapClick}
                 initialCoordinates={mapCoordinates}
                 userCountry={userCountry}
                 isFullScreen={true}
                 onAddressSelect={(address) => {
                   const coordinates = {
                     lat: parseFloat(address.lat),
                     lng: parseFloat(address.lon)
                   };
                   setMapCoordinates(coordinates);
                   setReportData(prev => ({
                     ...prev,
                     coordinates,
                     address: address.display_name
                   }));
                 }}
                 radiusKm={reportData.radius_km}
               />
            </div>
            {/* Map Footer */}
            <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="text-xs sm:text-sm text-gray-600">
                  <p>• Click anywhere on the map to select the incident location</p>
                  <p>• Use the address search above for precise addresses</p>
                  <p>• Selected coordinates will be saved with your report</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setMapCoordinates(null);
                      setReportData(prev => ({ ...prev, coordinates: undefined }));
                    }}
                    disabled={!mapCoordinates}
                    className="border-black text-black hover:bg-gray-100 text-sm w-full sm:w-auto"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Clear Selection
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowMap(false)}
                    className="bg-black hover:bg-gray-800 text-white text-sm w-full sm:w-auto"
                  >
                    Confirm Location
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
