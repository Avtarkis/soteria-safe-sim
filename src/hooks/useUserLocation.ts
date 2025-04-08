
import { useLocationState } from './location/useLocationState';
import { useLocationUpdater } from './location/useLocationUpdater';
import { useGeolocationWatch } from './location/useGeolocationWatch';
import { useInitialLocation } from './location/useInitialLocation';

export const useUserLocation = () => {
  // Get location state (coordinates and accuracy)
  const {
    userLocation,
    setUserLocation,
    locationAccuracy,
    setLocationAccuracy
  } = useLocationState();
  
  // Location updater with debounce and filtering
  const locationUpdater = useLocationUpdater(setUserLocation, setLocationAccuracy);
  
  // Geolocation watcher
  const geolocationWatch = useGeolocationWatch(locationUpdater.handleLocationUpdate);
  
  // Initialize location tracking
  useInitialLocation({
    startHighAccuracyWatch: geolocationWatch.startHighAccuracyWatch,
    startStandardWatch: geolocationWatch.startStandardWatch,
    useDefaultLocation: () => geolocationWatch.useDefaultLocation()
  });
  
  // Return the combined API
  return {
    userLocation,
    locationAccuracy,
    setUserLocation,
    setLocationAccuracy
  };
};

export default useUserLocation;
