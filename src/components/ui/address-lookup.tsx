'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';

import { Card, CardContent } from '@/components/ui/card';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { useCountryFilter } from '@/lib/utils/country-filter';

interface AddressResult {
  id?: string;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

interface AddressLookupProps {
  onAddressSelect: (address: AddressResult) => void;
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function AddressLookup({ onAddressSelect, placeholder = "Search for an address...", className = "", value, onChange }: Readonly<AddressLookupProps>) {
  const { userCountry } = useCountryFilter();
  const [query, setQuery] = useState(value ?? '');
  const [results, setResults] = useState<AddressResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const searchAddresses = useCallback(async (searchQuery: string) => {
    if (!userCountry) return;

    setIsLoading(true);
    try {
      console.log('🔧 AddressLookup: Searching for:', searchQuery, 'in country:', userCountry.code);
      
      // Use our internal geocoding API
      const response = await fetch(
        `/api/geocoding/search?` +
        `q=${encodeURIComponent(searchQuery)}&` +
        `country=${userCountry.code}&` +
        `limit=10`
      );

      if (response.ok) {
        const data = await response.json();
        console.log('🔧 AddressLookup: API response:', data);
        console.log('🔧 AddressLookup: Results count:', data.results?.length);
        
        const results = data.results ?? [];
        console.log('🔧 AddressLookup: Setting results:', results);
        console.log('🔧 AddressLookup: Setting showResults to:', results.length > 0);
        
        setResults(results);
        setShowResults(results.length > 0);
        setSelectedIndex(-1);
      } else {
        console.error('🔧 AddressLookup: Response not ok:', response.status);
      }
    } catch (error) {
      console.error('🔧 AddressLookup: Address search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [userCountry]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 3) {
        console.log('🔧 AddressLookup: Triggering search for:', query);
        searchAddresses(query);
      } else {
        console.log('🔧 AddressLookup: Query too short, clearing results');
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchAddresses]);

  // Sync internal query state with external value prop
  useEffect(() => {
    if (value !== undefined && value !== query) {
      setQuery(value);
    }
  }, [value, query]);

  // Debug: Log state changes
  useEffect(() => {
    console.log('🔧 AddressLookup: State changed - showResults:', showResults, 'results.length:', results.length, 'query:', query);
  }, [showResults, results, query]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node) && 
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddressSelect = (address: AddressResult) => {
    onAddressSelect(address);
    setQuery(address.display_name);
    setShowResults(false);
    setResults([]);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleAddressSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setResults([]);
        inputRef.current?.blur();
        break;
    }
  };

  const formatAddress = (address: AddressResult) => {
    const addr = address.address;
    const parts = [
      addr.house_number,
      addr.road,
      addr.suburb,
      addr.city,
      addr.state,
      addr.postcode
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  const handleInputFocus = () => {
    if (results.length > 0) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    // Don't hide results on blur to keep dropdown visible while typing
    // Only hide when clicking outside or selecting an address
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            const newValue = e.target.value;
            setQuery(newValue);
            if (onChange) {
              onChange(newValue);
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="pr-10 pl-4"
        />
        {isLoading ? (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        ) : (
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        )}
      </div>

             
       
                                                                                                                               {/* Results Dropdown */}
                                               {showResults && results.length > 0 && (
               <Card 
                 ref={resultsRef}
                 className="absolute top-full left-0 right-0 mt-1 z-[9999] max-h-60 overflow-y-auto shadow-lg border-gray-200 bg-white !p-0 !py-0 !px-0"
               >
              <CardContent className="!p-0 !px-0">
                             <div className="p-2 text-xs text-gray-500 border-b">
                  Found {results.length} results for &ldquo;{query}&rdquo;
                </div>
             {results.map((result, index) => (
               <button
                 key={`${result.lat}-${result.lon}-${index}`}
                 onClick={() => handleAddressSelect(result)}
                 className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                   index === selectedIndex ? 'bg-gray-100' : ''
                 } ${index < results.length - 1 ? 'border-b border-gray-100' : ''}`}
               >
                 <div className="flex items-start space-x-3">
                   <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                   <div className="flex-1 min-w-0">
                     <div className="font-medium text-gray-900 truncate">
                       {formatAddress(result)}
                     </div>
                     <div className="text-sm text-gray-500 truncate">
                       {result.address.city ?? result.address.town ?? result.address.suburb}, {result.address.state} {result.address.postcode}
                     </div>
                     <div className="text-xs text-gray-400 mt-1">
                       Coordinates: {parseFloat(result.lat).toFixed(4)}, {parseFloat(result.lon).toFixed(4)}
                     </div>
                   </div>
                 </div>
               </button>
             ))}
           </CardContent>
         </Card>
       )}

                                                       {/* No Results */}
                                       {showResults && results.length === 0 && query.length >= 3 && !isLoading && (
             <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg border-gray-200 !p-0 !py-0 !px-0">
            <CardContent className="!p-0 !px-0  text-center text-gray-500">
            <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p>No addresses found</p>
            <p className="text-sm">Try a different search term</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
