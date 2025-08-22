'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/lib/auth/auth-store';

interface Country {
  id: string;
  name: string;
  code: string;
  timezone: string;
  currency: string;
  emergency_number?: string;
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
    if (!userProfile?.country_id) {
      console.log('⚠️ CountryProvider: No country_id in user profile');
      setIsCountryLoaded(true);
      return;
    }

    // Use country data directly from user profile - no API call needed
    // The country object only has name and code from the join
    const countryData = {
      id: userProfile.country_id,
      name: userProfile.country?.name || 'Unknown Country',
      code: userProfile.country?.code || 'UN',
      timezone: 'UTC', // Default timezone
      currency: 'USD', // Default currency
      emergency_number: undefined, // Default emergency number
      active: true,
      settings: {} // Default empty settings
    };

    console.log('✅ CountryProvider: Using country data from profile:', countryData);
    setUserCountry(countryData);
    setIsCountryLoaded(true);
    setError(null);
  }, [userProfile?.country_id, userProfile?.country]);

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
