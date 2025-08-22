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

  // Debug logging
  useEffect(() => {
    console.log('🔍 CountryProvider: Component mounted');
    console.log('🔍 CountryProvider: Initial state:', {
      hasUserProfile: !!userProfile,
      userId: userProfile?.id,
      countryId: userProfile?.country_id,
      fullName: userProfile?.full_name
    });
  }, [userProfile]);

  useEffect(() => {
    console.log('🔍 CountryProvider: User profile changed:', {
      hasUserProfile: !!userProfile,
      userId: userProfile?.id,
      countryId: userProfile?.country_id,
      fullName: userProfile?.full_name
    });
  }, [userProfile]);

  useEffect(() => {
    const fetchUserCountry = async () => {
      console.log('🔍 CountryProvider: Starting country fetch...');
      
      if (!userProfile?.country_id) {
        console.log('⚠️ CountryProvider: No country_id in user profile, skipping fetch');
        setIsCountryLoaded(true);
        return;
      }

      try {
        setError(null);
        console.log('🔍 CountryProvider: Fetching country data for ID:', userProfile.country_id);

        // Fetch country details from Supabase
        const response = await fetch(`/api/countries/${userProfile.country_id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch country data');
        }

        const countryData = await response.json();
        console.log('✅ CountryProvider: Country data fetched successfully:', countryData);
        setUserCountry(countryData);
        setIsCountryLoaded(true);
      } catch (err) {
        console.error('❌ CountryProvider: Error fetching user country:', err);
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

  // Always provide a context value, even if empty
  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const context = useContext(CountryContext);
  if (context === undefined) {
    // Instead of throwing an error, provide a default context
    console.warn('⚠️ useCountry: Context not found, providing default values - NEW VERSION');
    return {
      userCountry: null,
      error: 'Country context not available',
      isCountryLoaded: false
    };
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
