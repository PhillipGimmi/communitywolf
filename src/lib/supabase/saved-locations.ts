import { 
  fetchSavedLocations, 
  fetchPrimaryLocation, 
  createLocation, 
  updateLocation, 
  deleteLocation 
} from './saved-locations-utils';

// Re-export the shared functions with the original names
export const getSavedLocations = fetchSavedLocations;
export const getPrimaryLocation = fetchPrimaryLocation;
export const createSavedLocation = createLocation;
export const updateSavedLocation = updateLocation;
export const deleteSavedLocation = deleteLocation;
