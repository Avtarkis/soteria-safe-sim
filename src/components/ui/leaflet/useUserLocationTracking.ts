
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { createPulsingIcon } from './UserLocationMarker';

export const useUserLocationTracking = (
  map: L.Map | null,
  showUserLocation: boolean,
  setUserLocation?: (location: [number, number]) => void
) => {
  const userLocationMarkerRef = useRef<L.Marker | null>(null);
  const userLocationCircleRef = useRef<L.Circle | null>(null);
  const userLocationAccuracyRef = useRef<number>(0);
  const userLocationLatLngRef = useRef<L.LatLng | null>(null);
  const locationTrackingInitializedRef = useRef<boolean>(false);
  const watchIdRef = useRef<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const lastEventTimeRef = useRef<number>(0);
  const errorCountRef = useRef<number>(0);

  // Handle location found event with improved error handling
  const handleLocationFound = (e: L.LocationEvent) => {
    try {
      if (!map) return;
      
      // Allow more frequent updates for better tracking - 500ms minimum interval
      const now = Date.now();
      if (now - lastEventTimeRef.current < 500) {
        return;
      }
      lastEventTimeRef.current = now;
      
      console.log("High-precision location found:", e);
      const radius = e.accuracy;
      userLocationAccuracyRef.current = radius;
      userLocationLatLngRef.current = e.latlng;
      
      // Remove previous markers if they exist
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
      
      // Add marker for user location with the pulsing icon
      try {
        const pulsingIcon = createPulsingIcon();
        userLocationMarkerRef.current = L.marker(e.latlng, { icon: pulsingIcon })
          .addTo(map)
          .bindPopup(`
            <b>Your Exact Location</b><br>
            Lat: ${e.latlng.lat.toFixed(8)}<br>
            Lng: ${e.latlng.lng.toFixed(8)}<br>
            Accuracy: ±${radius < 1 ? radius.toFixed(2) : radius.toFixed(1)} meters
          `);

        // Add circle showing accuracy radius
        userLocationCircleRef.current = L.circle(e.latlng, {
          radius: radius,
          color: '#4F46E5',
          fillColor: '#4F46E5',
          fillOpacity: 0.1,
          weight: 1
        }).addTo(map);
        
        // Center map on user location with appropriate zoom level based on accuracy
        // Only center if we have high accuracy or it's the first location fix
        if (radius < 50 || !locationTrackingInitializedRef.current) {
          // Use higher zoom for more precise location
          const zoomLevel = radius < 10 ? 18 : 
                           radius < 30 ? 17 : 
                           radius < 100 ? 16 : 15;
          
          map.setView(e.latlng, zoomLevel, { animate: true });
          locationTrackingInitializedRef.current = true;
        }
        
        // Reset error count on successful update
        errorCountRef.current = 0;
      } catch (error) {
        console.error("Error creating markers:", error);
        errorCountRef.current++;
      }
      
      // Update user location through callback if provided
      if (setUserLocation) {
        setUserLocation([e.latlng.lat, e.latlng.lng]);
      }

      // Dispatch custom event so other components can react to location updates
      try {
        const customEvent = new CustomEvent('userLocationUpdated', {
          detail: {
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            accuracy: radius
          }
        });
        document.dispatchEvent(customEvent);
      } catch (error) {
        console.error("Error dispatching location event:", error);
      }
    } catch (error) {
      console.error("Error in handleLocationFound:", error);
      errorCountRef.current++;
      
      // If we hit too many errors, stop tracking to prevent blank screen
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
  };

  // Handle location error with better fallback
  const handleLocationError = (e: L.ErrorEvent) => {
    console.error('Location error:', e.message);
    
    // Try to use navigator.geolocation as a fallback with maximum accuracy
    if (navigator.geolocation) {
      console.log("Trying fallback geolocation with high accuracy");
      if (watchIdRef.current === null) {
        try {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
              if (!map) return;
              
              const latlng = L.latLng(position.coords.latitude, position.coords.longitude);
              const accuracy = position.coords.accuracy;
              
              // Manually create a locationfound event
              const locationEvent = {
                latlng,
                accuracy,
                timestamp: position.timestamp,
                bounds: L.latLngBounds(
                  [position.coords.latitude - 0.0001, position.coords.longitude - 0.0001],
                  [position.coords.latitude + 0.0001, position.coords.longitude + 0.0001]
                )
              } as L.LocationEvent;
              
              // Trigger the locationfound event handler
              handleLocationFound(locationEvent);
            },
            (error) => {
              console.error('Geolocation error:', error.message);
              errorCountRef.current++;
            },
            { 
              enableHighAccuracy: true, 
              timeout: 15000, 
              maximumAge: 0 // Don't use cached positions
            }
          );
        } catch (error) {
          console.error("Error setting up geolocation watch:", error);
        }
      }
    }
  };

  // Start or stop location tracking based on showUserLocation
  useEffect(() => {
    try {
      if (!map) return;
      
      // Set up event handlers
      map.on('locationfound', handleLocationFound);
      map.on('locationerror', handleLocationError);
      
      // Prevent duplicate initialization if tracking status hasn't changed
      if (showUserLocation && !isTracking) {
        console.log("Starting high-precision location tracking");
        
        // Stop any existing tracking first to ensure clean state
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        
        if (map.stopLocate) {
          map.stopLocate();
        }
        
        // Start tracking with highest accuracy settings
        map.locate({ 
          setView: true, 
          maxZoom: 18, 
          watch: true,
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
        
        // Also use the native geolocation API for redundancy and better accuracy on some devices
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            if (!map) return;
            
            const latlng = L.latLng(position.coords.latitude, position.coords.longitude);
            const accuracy = position.coords.accuracy;
            
            // Manually create a locationfound event
            const locationEvent = {
              latlng,
              accuracy,
              timestamp: position.timestamp,
              bounds: L.latLngBounds(
                [position.coords.latitude - 0.0001, position.coords.longitude - 0.0001],
                [position.coords.latitude + 0.0001, position.coords.longitude + 0.0001]
              )
            } as L.LocationEvent;
            
            // Trigger the locationfound event handler
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
      } else if (!showUserLocation && isTracking) {
        console.log("Stopping location tracking");
        
        // Don't actually stop locating, just hide the markers
        if (userLocationMarkerRef.current) {
          try {
            map.removeLayer(userLocationMarkerRef.current);
          } catch (error) {
            console.error("Error removing marker on toggle off:", error);
          }
        }
        if (userLocationCircleRef.current) {
          try {
            map.removeLayer(userLocationCircleRef.current);
          } catch (error) {
            console.error("Error removing circle on toggle off:", error);
          }
        }
        
        setIsTracking(false);
      }

      return () => {
        if (map) {
          try {
            // Clean up event handlers when component unmounts
            map.off('locationfound', handleLocationFound);
            map.off('locationerror', handleLocationError);
            
            // Clear watch position if using navigator
            if (watchIdRef.current !== null) {
              navigator.geolocation.clearWatch(watchIdRef.current);
              watchIdRef.current = null;
            }
          } catch (error) {
            console.error("Error cleaning up location tracking:", error);
          }
        }
      };
    } catch (error) {
      console.error("Error in location tracking effect:", error);
    }
  }, [map, showUserLocation, setUserLocation, isTracking]);

  return {
    getUserLocation: (): [number, number] | null => {
      if (userLocationLatLngRef.current) {
        return [userLocationLatLngRef.current.lat, userLocationLatLngRef.current.lng];
      }
      return null;
    },
    locationAccuracy: userLocationAccuracyRef.current
  };
};

export default useUserLocationTracking;
