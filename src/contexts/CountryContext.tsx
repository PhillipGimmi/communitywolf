'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/lib/auth/auth-store';

interface Country {
  id: string;
  name: string;
  code: string;
  timezone: string;
  currency: string;
  emergency_number: string;
  active: boolean;
  settings: Record<string, string | number | boolean>;
}

interface CountryContextType {
  userCountry: Country | null;
  error: string | null;
  isCountryLoaded: boolean;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export function CountryProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { userProfile } = useAuthStore();
  const [userCountry, setUserCountry] = useState<Country | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCountryLoaded, setIsCountryLoaded] = useState(false);

  useEffect(() => {
    const fetchUserCountry = async () => {
      if (!userProfile?.country_id) {
        setIsCountryLoaded(true);
        return;
      }

      try {
        setError(null);

        // Fetch country details from Supabase
        const response = await fetch(`/api/countries/${userProfile.country_id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch country data');
        }

        const countryData = await response.json();
        setUserCountry(countryData);
        setIsCountryLoaded(true);
      } catch (err) {
        console.error('Error fetching user country:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch country data');
        setIsCountryLoaded(true);
      }
    };

    fetchUserCountry();
  }, [userProfile?.country_id]);

  const value = useMemo<CountryContextType>(() => ({
    userCountry,
    error,
    isCountryLoaded,
  }), [userCountry, error, isCountryLoaded]);

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const context = useContext(CountryContext);
  if (context === undefined) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
}

// Hook for components that need to ensure country data is loaded
export function useCountryRequired() {
  const { userCountry, error, isCountryLoaded } = useCountry();
  
  if (!isCountryLoaded) {
    return { userCountry: null, error: null, isCountryLoaded: false };
  }

  if (error) {
    return { userCountry: null, error, isCountryLoaded: true };
  }

  if (!userCountry) {
    return { userCountry: null, error: 'No country data available', isCountryLoaded: true };
  }

  return { userCountry, error: null, isCountryLoaded: true };
}
