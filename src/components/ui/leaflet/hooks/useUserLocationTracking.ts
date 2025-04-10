
import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { ThreatMarker } from '@/types/threats';

interface LocationTrackingConfig {
  map: L.Map | null;
  showUserLocation: boolean;
  threatMarkers: ThreatMarker[];
}

/**
 * Hook to track and visualize user location on a Leaflet map
 */
export const useUserLocationTracking = ({
  map,
  showUserLocation,
  threatMarkers = []
}: LocationTrackingConfig) => {
  // References for tracking map objects and state
  const userLocationMarkerRef = useRef<L.Marker | null>(null);
  const userLocationCircleRef = useRef<L.Circle | null>(null);
  const userLocationAccuracyRef = useRef<number>(0);
  const userLocationLatLngRef = useRef<L.LatLng | null>(null);
  const streetLabelRef = useRef<L.Marker | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const safetyLevelRef = useRef<'safe' | 'caution' | 'danger'>('safe');
  
  // Function to safely remove a map layer
  const safelyRemoveLayer = useCallback((layer: L.Layer | null) => {
    if (layer && map) {
      try {
        if (map.hasLayer(layer)) {
          map.removeLayer(layer);
        }
      } catch (error) {
        console.error("Error removing layer:", error);
      }
    }
    return null;
  }, [map]);
  
  // Function to clean up all location layers
  const cleanupLocationLayers = useCallback(() => {
    if (!map) return;
    
    try {
      userLocationMarkerRef.current = safelyRemoveLayer(userLocationMarkerRef.current);
      userLocationCircleRef.current = safelyRemoveLayer(userLocationCircleRef.current);
      streetLabelRef.current = safelyRemoveLayer(streetLabelRef.current);
    } catch (error) {
      console.error("Error in location layers cleanup:", error);
    }
  }, [map, safelyRemoveLayer]);

  // Handle location updates
  const handleLocationUpdate = useCallback((position: GeolocationPosition) => {
    if (!map) return;
    
    try {
      const { latitude, longitude, accuracy } = position.coords;
      
      // Skip extremely inaccurate locations (>10km)
      if (accuracy > 10000) {
        console.warn(`Skipping inaccurate location update: ${accuracy.toFixed(1)}m`);
        return;
      }
      
      console.log(`Location update: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}, accuracy: ${accuracy.toFixed(1)}m`);
      
      // Update refs with new location
      userLocationLatLngRef.current = L.latLng(latitude, longitude);
      userLocationAccuracyRef.current = accuracy;
      
      // Create location marker if it doesn't exist
      if (!userLocationMarkerRef.current) {
        userLocationMarkerRef.current = L.marker([latitude, longitude], {
          icon: L.divIcon({
            className: 'user-location-marker',
            html: '<div class="pulse"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })
        }).addTo(map);
      } else {
        userLocationMarkerRef.current.setLatLng([latitude, longitude]);
      }
      
      // Create accuracy circle if it doesn't exist
      if (!userLocationCircleRef.current) {
        userLocationCircleRef.current = L.circle([latitude, longitude], {
          radius: accuracy,
          color: '#4a80f5',
          fillColor: '#4a80f580',
          fillOpacity: 0.2,
          weight: 1
        }).addTo(map);
      } else {
        userLocationCircleRef.current.setLatLng([latitude, longitude]);
        userLocationCircleRef.current.setRadius(accuracy);
      }
      
      // Determine safety level based on proximity to threats
      safetyLevelRef.current = determineSafetyLevel(latitude, longitude, threatMarkers);
    } catch (error) {
      console.error("Error handling location update:", error);
    }
  }, [map, threatMarkers, safelyRemoveLayer]);
  
  // Start/stop location tracking based on props
  useEffect(() => {
    if (!map) return;
    
    if (showUserLocation && !isTracking) {
      console.log("Starting location tracking");
      
      // Clean up existing tracking
      cleanupLocationLayers();
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      
      // Start high accuracy tracking
      watchIdRef.current = navigator.geolocation.watchPosition(
        handleLocationUpdate,
        (error) => console.error("Geolocation error:", error.message),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
      
      setIsTracking(true);
    } else if (!showUserLocation && isTracking) {
      console.log("Stopping location tracking");
      
      cleanupLocationLayers();
      
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      
      setIsTracking(false);
    }
    
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      cleanupLocationLayers();
    };
  }, [map, showUserLocation, isTracking, cleanupLocationLayers, handleLocationUpdate]);
  
  // Center map on user location
  const centerMapOnUserLocation = useCallback(() => {
    if (map && userLocationLatLngRef.current) {
      map.whenReady(() => {
        try {
          map.setView(userLocationLatLngRef.current, 15, { animate: true });
        } catch (error) {
          console.error("Error centering map:", error);
        }
      });
    }
  }, [map]);
  
  // Listen for center map events
  useEffect(() => {
    const handleCenterMap = () => centerMapOnUserLocation();
    document.addEventListener('centerMapOnUserLocation', handleCenterMap as EventListener);
    
    return () => {
      document.removeEventListener('centerMapOnUserLocation', handleCenterMap as EventListener);
    };
  }, [centerMapOnUserLocation]);

  return {
    userLocation: userLocationLatLngRef.current 
      ? [userLocationLatLngRef.current.lat, userLocationLatLngRef.current.lng] as [number, number]
      : null,
    locationAccuracy: userLocationAccuracyRef.current,
    safetyLevel: safetyLevelRef.current,
    centerMapOnUserLocation
  };
};

// Helper function to determine safety level based on proximity to threats
function determineSafetyLevel(
  latitude: number, 
  longitude: number, 
  threatMarkers: ThreatMarker[]
): 'safe' | 'caution' | 'danger' {
  if (!threatMarkers.length) return 'safe';
  
  // Calculate distances to all threats
  const distances = threatMarkers.map(threat => {
    const [threatLat, threatLng] = threat.position;
    // Simple distance calculation (not accounting for Earth's curvature)
    return Math.sqrt(
      Math.pow(latitude - threatLat, 2) + 
      Math.pow(longitude - threatLng, 2)
    );
  });
  
  // Find the minimum distance
  const minDistance = Math.min(...distances);
  
  // Determine safety level based on proximity
  if (minDistance < 0.01) return 'danger';     // Within ~1km
  if (minDistance < 0.05) return 'caution';    // Within ~5km
  return 'safe';
}

export default useUserLocationTracking;
