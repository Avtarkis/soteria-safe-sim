
import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { createPulsingIcon } from './UserLocationMarker';
import { addStreetLabels, cleanupStreetLabels } from './utils/streetLabels';
import { determineSafetyLevel } from './utils/safetyAssessment';
import { getZoomLevelForAccuracy } from './utils/geoUtils';
import { dispatchLocationUpdate } from './utils/locationEvents';

/**
 * Hook to track and visualize user location on a Leaflet map
 */
export const useUserLocationTracking = (
  map: L.Map | null,
  showUserLocation: boolean,
  setUserLocation?: (location: [number, number]) => void,
  threatMarkers: any[] = []
) => {
  // References for tracking map objects and state
  const userLocationMarkerRef = useRef<L.Marker | null>(null);
  const userLocationCircleRef = useRef<L.Circle | null>(null);
  const userLocationAccuracyRef = useRef<number>(0);
  const userLocationLatLngRef = useRef<L.LatLng | null>(null);
  const streetLabelRef = useRef<L.Marker | null>(null);
  const locationTrackingInitializedRef = useRef<boolean>(false);
  const watchIdRef = useRef<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const lastEventTimeRef = useRef<number>(0);
  const errorCountRef = useRef<number>(0);
  const highPrecisionModeRef = useRef<boolean>(false);
  const safetyLevelRef = useRef<'safe' | 'caution' | 'danger'>('safe');

  /**
   * Handle location updates from the map or geolocation API
   */
  const handleLocationFound = useCallback((e: L.LocationEvent) => {
    try {
      if (!map) return;
      
      // Debounce frequent updates
      const now = Date.now();
      if (now - lastEventTimeRef.current < 300) {
        return;
      }
      lastEventTimeRef.current = now;
      
      console.log("Location update received:", e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6), "accuracy:", e.accuracy);
      
      const radius = e.accuracy;
      userLocationAccuracyRef.current = radius;
      userLocationLatLngRef.current = e.latlng;
      
      // Remove existing markers if present
      if (userLocationMarkerRef.current) {
        try {
          map.removeLayer(userLocationMarkerRef.current);
        } catch (error) {
          console.error("Error removing marker:", error);
        }
      }
      if (userLocationCircleRef.current) {
        try {
          map.removeLayer(userLocationCircleRef.current);
        } catch (error) {
          console.error("Error removing circle:", error);
        }
      }
      
      // Determine safety level based on nearby threats
      if (threatMarkers && threatMarkers.length > 0) {
        safetyLevelRef.current = determineSafetyLevel(
          [e.latlng.lat, e.latlng.lng],
          threatMarkers
        );
      }
      
      // Create and add user location marker
      try {
        const pulsingIcon = createPulsingIcon(safetyLevelRef.current);
        userLocationMarkerRef.current = L.marker(e.latlng, { icon: pulsingIcon })
          .addTo(map)
          .bindPopup(`
            <b>Your Exact Location</b><br>
            Lat: ${e.latlng.lat.toFixed(8)}<br>
            Lng: ${e.latlng.lng.toFixed(8)}<br>
            Accuracy: ±${radius < 1 ? radius.toFixed(2) : radius.toFixed(1)} meters
          `);

        // Color the accuracy circle based on safety level
        const circleColor = safetyLevelRef.current === 'safe' ? '#4F46E5' : 
                          safetyLevelRef.current === 'caution' ? '#F59E0B' : '#EF4444';
        
        // Add accuracy circle
        userLocationCircleRef.current = L.circle(e.latlng, {
          radius: radius,
          color: circleColor,
          fillColor: circleColor,
          fillOpacity: 0.1,
          weight: 2
        }).addTo(map);
        
        // Update street labels
        addStreetLabels(map, e.latlng, userLocationAccuracyRef.current, streetLabelRef);
        
        // Set view if in high precision mode or first initialization
        if (highPrecisionModeRef.current || !locationTrackingInitializedRef.current) {
          const zoomLevel = getZoomLevelForAccuracy(radius);
          map.setView(e.latlng, zoomLevel, { animate: true });
          
          if (locationTrackingInitializedRef.current) {
            highPrecisionModeRef.current = false;
          }
        }
        
        locationTrackingInitializedRef.current = true;
        
        // Reset error count on successful update
        errorCountRef.current = 0;
      } catch (error) {
        console.error("Error creating markers:", error);
        errorCountRef.current++;
      }
      
      // Update parent component with location if callback provided
      if (setUserLocation) {
        setUserLocation([e.latlng.lat, e.latlng.lng]);
      }

      // Dispatch event for other components to respond
      dispatchLocationUpdate(e.latlng.lat, e.latlng.lng, radius, safetyLevelRef.current);
      
    } catch (error) {
      console.error("Error in handleLocationFound:", error);
      errorCountRef.current++;
      
      // Stop location tracking if too many errors
      if (errorCountRef.current > 5) {
        console.error("Too many errors during location tracking, stopping to prevent crashes");
        try {
          if (map && map.stopLocate) {
            map.stopLocate();
          }
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
          }
        } catch (e) {
          console.error("Error stopping location services:", e);
        }
      }
    }
  }, [map, setUserLocation, threatMarkers]);

  /**
   * Handle location errors from the map API
   */
  const handleLocationError = useCallback((e: L.ErrorEvent) => {
    console.error('Location error:', e.message);
    
    // Try fallback to browser geolocation API
    if (navigator.geolocation && watchIdRef.current === null) {
      console.log("Trying fallback geolocation with high accuracy");
      try {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            if (!map) return;
            
            // Convert browser position to Leaflet format
            const latlng = L.latLng(position.coords.latitude, position.coords.longitude);
            const accuracy = position.coords.accuracy;
            
            // Create a synthetic location event
            const locationEvent = {
              latlng,
              accuracy,
              timestamp: position.timestamp,
              bounds: L.latLngBounds(
                [position.coords.latitude - 0.0001, position.coords.longitude - 0.0001],
                [position.coords.latitude + 0.0001, position.coords.longitude + 0.0001]
              )
            } as L.LocationEvent;
            
            handleLocationFound(locationEvent);
          },
          (error) => {
            console.error('Geolocation error:', error.message);
            errorCountRef.current++;
          },
          { 
            enableHighAccuracy: true, 
            timeout: 15000, 
            maximumAge: 0
          }
        );
      } catch (error) {
        console.error("Error setting up geolocation watch:", error);
      }
    }
  }, [map, handleLocationFound]);

  /**
   * Effect to listen for high precision mode activation
   */
  useEffect(() => {
    const handleHighPrecisionMode = () => {
      highPrecisionModeRef.current = true;
      
      // Update map if we have a current user location
      if (userLocationLatLngRef.current && map) {
        addStreetLabels(map, userLocationLatLngRef.current, userLocationAccuracyRef.current, streetLabelRef);
      }
    };
    
    document.addEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
    
    return () => {
      document.removeEventListener('highPrecisionModeActivated', handleHighPrecisionMode);
    };
  }, [map]);

  /**
   * Main effect to handle location tracking based on showUserLocation prop
   */
  useEffect(() => {
    try {
      if (!map) return;
      
      // Set up event listeners
      map.on('locationfound', handleLocationFound);
      map.on('locationerror', handleLocationError);
      
      // Start location tracking if enabled
      if (showUserLocation && !isTracking) {
        console.log("Starting high-precision location tracking");
        
        highPrecisionModeRef.current = true;
        
        // Clear any existing tracking
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        
        if (map.stopLocate) {
          map.stopLocate();
        }
        
        // Start map's built-in location tracking
        map.locate({ 
          setView: false,
          maxZoom: 19, 
          watch: true,
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
        
        // Get initial position with browser API for redundancy
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("Initial high-precision position:", position);
            
            if (map && position) {
              const latlng = L.latLng(position.coords.latitude, position.coords.longitude);
              const locationEvent = {
                latlng,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp,
                bounds: L.latLngBounds(
                  [position.coords.latitude - 0.0001, position.coords.longitude - 0.0001],
                  [position.coords.latitude + 0.0001, position.coords.longitude + 0.0001]
                )
              } as L.LocationEvent;
              
              handleLocationFound(locationEvent);
            }
          },
          (error) => {
            console.error("Error getting initial position:", error);
          },
          { 
            enableHighAccuracy: true, 
            timeout: 10000, 
            maximumAge: 0 
          }
        );
        
        // Set up a continuous position watch as fallback/supplement
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            if (!map) return;
            
            const latlng = L.latLng(position.coords.latitude, position.coords.longitude);
            const accuracy = position.coords.accuracy;
            
            const locationEvent = {
              latlng,
              accuracy,
              timestamp: position.timestamp,
              bounds: L.latLngBounds(
                [position.coords.latitude - 0.0001, position.coords.longitude - 0.0001],
                [position.coords.latitude + 0.0001, position.coords.longitude + 0.0001]
              )
            } as L.LocationEvent;
            
            handleLocationFound(locationEvent);
          },
          (error) => {
            console.error('Geolocation watch error:', error.message);
          },
          { 
            enableHighAccuracy: true, 
            timeout: 15000, 
            maximumAge: 0 
          }
        );
        
        locationTrackingInitializedRef.current = true;
        setIsTracking(true);
      } 
      // Handle disabling location tracking
      else if (!showUserLocation && isTracking) {
        console.log("Stopping location tracking");
        
        // Remove markers
        if (userLocationMarkerRef.current) {
          try {
            map.removeLayer(userLocationMarkerRef.current);
            userLocationMarkerRef.current = null;
          } catch (error) {
            console.error("Error removing marker on toggle off:", error);
          }
        }
        if (userLocationCircleRef.current) {
          try {
            map.removeLayer(userLocationCircleRef.current);
            userLocationCircleRef.current = null;
          } catch (error) {
            console.error("Error removing circle on toggle off:", error);
          }
        }
        if (streetLabelRef.current) {
          try {
            map.removeLayer(streetLabelRef.current);
            streetLabelRef.current = null;
          } catch (error) {
            console.error("Error removing street label on toggle off:", error);
          }
        }
        
        // Stop location tracking
        map.stopLocate();
        
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        
        setIsTracking(false);
      }

      // Cleanup function
      return () => {
        if (map) {
          try {
            map.off('locationfound', handleLocationFound);
            map.off('locationerror', handleLocationError);
            
            if (watchIdRef.current !== null) {
              navigator.geolocation.clearWatch(watchIdRef.current);
              watchIdRef.current = null;
            }
            
            cleanupStreetLabels();
          } catch (error) {
            console.error("Error cleaning up location tracking:", error);
          }
        }
      };
    } catch (error) {
      console.error("Error in location tracking effect:", error);
    }
  }, [map, showUserLocation, handleLocationFound, handleLocationError, isTracking, setUserLocation]);

  /**
   * Effect to handle "center map on user" requests
   */
  useEffect(() => {
    const handleCenterMap = () => {
      if (map && userLocationLatLngRef.current) {
        highPrecisionModeRef.current = true;
        
        // Request a fresh location update
        map.locate({ 
          setView: false,
          maxZoom: 19, 
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
        
        // Center map on user location
        map.setView(userLocationLatLngRef.current, 18, { animate: true });
        
        // Update street labels
        addStreetLabels(map, userLocationLatLngRef.current, userLocationAccuracyRef.current, streetLabelRef);
      }
    };

    document.addEventListener('centerMapOnUserLocation', handleCenterMap as EventListener);
    
    return () => {
      document.removeEventListener('centerMapOnUserLocation', handleCenterMap as EventListener);
    };
  }, [map]);

  return {
    getUserLocation: (): [number, number] | null => {
      if (userLocationLatLngRef.current) {
        return [userLocationLatLngRef.current.lat, userLocationLatLngRef.current.lng];
      }
      return null;
    },
    locationAccuracy: userLocationAccuracyRef.current,
    safetyLevel: safetyLevelRef.current
  };
};

export default useUserLocationTracking;
