import { useCountry } from '@/contexts/CountryContext';

/**
 * Hook to get country-based filter parameters for API calls
 * This ensures all data operations are scoped to the user's country
 */
export function useCountryFilter() {
  const { userCountry, error } = useCountry();

  const getCountryFilter = () => {
    if (!userCountry) {
      return null;
    }

    return {
      country_id: userCountry.id,
      country_code: userCountry.code,
    };
  };

  const getCountryQueryParams = () => {
    const filter = getCountryFilter();
    if (!filter) return '';

    return new URLSearchParams({
      country_id: filter.country_id,
      country_code: filter.country_code,
    }).toString();
  };

  const getCountryHeaders = () => {
    const filter = getCountryFilter();
    if (!filter) return {};

    return {
      'X-User-Country-ID': filter.country_id,
      'X-User-Country-Code': filter.country_code,
    };
  };

  return {
    userCountry,
    error,
    getCountryFilter,
    getCountryQueryParams,
    getCountryHeaders,
    // Helper to check if data belongs to user's country
    isDataFromUserCountry: (dataCountryId: string) => {
      return userCountry?.id === dataCountryId;
    },
    // Helper to get country-specific settings
    getCountrySettings: () => userCountry?.settings || {},
  };
}

/**
 * Utility function to filter an array of data by country
 */
export function filterDataByCountry<T extends { country_id?: string }>(
  data: T[],
  userCountryId: string
): T[] {
  if (!userCountryId) return data;
  return data.filter(item => item.country_id === userCountryId);
}

/**
 * Utility function to validate if a data item belongs to the user's country
 */
export function validateCountryAccess<T extends { country_id?: string }>(
  data: T,
  userCountryId: string
): boolean {
  if (!userCountryId) return false;
  return data.country_id === userCountryId;
}
