
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LocationUpdater } from './handlers/LocationUpdater';
import { LocationTracker } from './handlers/LocationTracker';
import { cleanupStreetLabels } from './utils/streetLabels';

/**
 * Hook to track and visualize user location on a Leaflet map
 */
const useLocationTracking = (
  map: L.Map | null,
  showUserLocation: boolean,
  threatMarkers: any[] = [],
  setUserLocation?: (location: [number, number]) => void
) => {
  // References for tracking map objects and state
  const userLocationMarkerRef = useRef<L.Marker | null>(null);
  const userLocationCircleRef = useRef<L.Circle | null>(null);
  const userLocationAccuracyRef = useRef<number>(0);
  const userLocationLatLngRef = useRef<L.LatLng | null>(null);
  const streetLabelRef = useRef<L.Marker | null>(null);
  const trackerRef = useRef<LocationTracker | null>(null);
  const updaterRef = useRef<LocationUpdater | null>(null);
  const safetyLevelRef = useRef<'safe' | 'caution' | 'danger'>('safe');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize location handlers when map changes
  useEffect(() => {
    if (!map) return;
    
    // Create location updater
    updaterRef.current = new LocationUpdater(
      map,
      userLocationMarkerRef,
      userLocationCircleRef,
      userLocationAccuracyRef,
      userLocationLatLngRef,
      streetLabelRef,
      safetyLevelRef,
      threatMarkers,
      setUserLocation
    );
    
    // Create location tracker
    trackerRef.current = new LocationTracker(
      map,
      updaterRef.current
    );
    
    // Set up event listeners
    const handleLocationFound = (e: L.LocationEvent) => {
      if (updaterRef.current) {
        updaterRef.current.updateLocation(e);
      }
    };
    
    const handleLocationError = (e: L.ErrorEvent) => {
      if (trackerRef.current) {
        trackerRef.current.handleLocationError(e);
      }
    };
    
    map.on('locationfound', handleLocationFound);
    map.on('locationerror', handleLocationError);
    
    setIsInitialized(true);
    
    // Cleanup function
    return () => {
      map.off('locationfound', handleLocationFound);
      map.off('locationerror', handleLocationError);
      
      if (trackerRef.current) {
        trackerRef.current.stopTracking();
      }
      
      cleanupStreetLabels();
    };
  }, [map, threatMarkers, setUserLocation]);
  
  // Start or stop location tracking based on showUserLocation prop
  useEffect(() => {
    if (!map || !isInitialized) return;
    
    if (showUserLocation && trackerRef.current) {
      trackerRef.current.startTracking(true);
    } else if (!showUserLocation && trackerRef.current) {
      trackerRef.current.stopTracking();
      
      // Remove markers
      if (userLocationMarkerRef.current) {
        try {
          map.removeLayer(userLocationMarkerRef.current);
          userLocationMarkerRef.current = null;
        } catch (error) {
          console.error("Error removing marker:", error);
        }
      }
      if (userLocationCircleRef.current) {
        try {
          map.removeLayer(userLocationCircleRef.current);
          userLocationCircleRef.current = null;
        } catch (error) {
          console.error("Error removing circle:", error);
        }
      }
      if (streetLabelRef.current) {
        try {
          map.removeLayer(streetLabelRef.current);
          streetLabelRef.current = null;
        } catch (error) {
          console.error("Error removing street label:", error);
        }
      }
    }
  }, [map, showUserLocation, isInitialized]);
  
  // Listen for high precision mode activation
  useEffect(() => {
    const handleHighPrecisionMode = () => {
      if (trackerRef.current && updaterRef.current) {
        trackerRef.current.startTracking(true);
        
        // Center map on user location if available
        if (userLocationLatLngRef.current) {
          updaterRef.current.centerMapOnLocation(true);
        }
      }
    };
    
    document.addEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
    
    return () => {
      document.removeEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
    };
  }, []);
  
  // Listen for center map requests
  useEffect(() => {
    const handleCenterMap = () => {
      if (updaterRef.current) {
        updaterRef.current.centerMapOnLocation();
      }
    };
    
    document.addEventListener('centerMapOnUserLocation', handleCenterMap as EventListener);
    
    return () => {
      document.removeEventListener('centerMapOnUserLocation', handleCenterMap as EventListener);
    };
  }, []);
  
  // Return user location information
  return {
    userLocation: userLocationLatLngRef.current 
      ? [userLocationLatLngRef.current.lat, userLocationLatLngRef.current.lng] as [number, number]
      : null,
    locationAccuracy: userLocationAccuracyRef.current,
    safetyLevel: safetyLevelRef.current,
    isTracking: trackerRef.current?.isActive() || false
  };
};

export default useLocationTracking;
