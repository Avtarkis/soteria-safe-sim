
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

  // Handle location found event
  const handleLocationFound = (e: L.LocationEvent) => {
    try {
      if (!map) return;
      
      // Throttle updates - no more than one update every 2 seconds
      const now = Date.now();
      if (now - lastEventTimeRef.current < 2000) {
        return;
      }
      lastEventTimeRef.current = now;
      
      console.log("Location found:", e);
      const radius = e.accuracy;
      userLocationAccuracyRef.current = radius;
      userLocationLatLngRef.current = e.latlng;
      
      // Remove previous markers if they exist
      if (userLocationMarkerRef.current) {
        map.removeLayer(userLocationMarkerRef.current);
      }
      if (userLocationCircleRef.current) {
        map.removeLayer(userLocationCircleRef.current);
      }
      
      // Add marker for user location with the pulsing icon
      const pulsingIcon = createPulsingIcon();
      userLocationMarkerRef.current = L.marker(e.latlng, { icon: pulsingIcon })
        .addTo(map)
        .bindPopup(`
          <b>Your Current Location</b><br>
          Lat: ${e.latlng.lat.toFixed(6)}<br>
          Lng: ${e.latlng.lng.toFixed(6)}<br>
          Accuracy: ±${radius.toFixed(1)} meters
        `);

      // Add circle showing accuracy radius
      userLocationCircleRef.current = L.circle(e.latlng, {
        radius: radius,
        color: '#4F46E5',
        fillColor: '#4F46E5',
        fillOpacity: 0.1,
        weight: 1
      }).addTo(map);
      
      // Update user location through callback if provided
      if (setUserLocation) {
        setUserLocation([e.latlng.lat, e.latlng.lng]);
      }

      // Dispatch custom event so other components can react to location updates
      const customEvent = new CustomEvent('userLocationUpdated', {
        detail: {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          accuracy: radius
        }
      });
      document.dispatchEvent(customEvent);
    } catch (error) {
      console.error("Error in handleLocationFound:", error);
    }
  };

  // Handle location error
  const handleLocationError = (e: L.ErrorEvent) => {
    console.error('Location error:', e.message);
    
    // Try to use navigator.geolocation as a fallback
    if (navigator.geolocation) {
      console.log("Trying fallback geolocation");
      if (watchIdRef.current === null) {
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
                [position.coords.latitude - 0.01, position.coords.longitude - 0.01],
                [position.coords.latitude + 0.01, position.coords.longitude + 0.01]
              )
            } as L.LocationEvent;
            
            // Trigger the locationfound event handler
            handleLocationFound(locationEvent);
          },
          (error) => {
            console.error('Geolocation error:', error.message);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
        );
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
        console.log("Starting location tracking");
        if (locationTrackingInitializedRef.current) {
          // If we've already initialized once, just toggle visibility instead of restarting tracking
          if (userLocationMarkerRef.current && userLocationCircleRef.current) {
            userLocationMarkerRef.current.addTo(map);
            userLocationCircleRef.current.addTo(map);
          } else {
            // Only get location if we don't have markers
            map.locate({ 
              setView: false, // Don't auto-set view to prevent map jumping
              maxZoom: 16, 
              watch: true,
              enableHighAccuracy: true
            });
          }
        } else {
          // First initialization
          map.locate({ 
            setView: true, 
            maxZoom: 16, 
            watch: true,
            enableHighAccuracy: true
          });
          locationTrackingInitializedRef.current = true;
        }
        setIsTracking(true);
      } else if (!showUserLocation && isTracking) {
        console.log("Stopping location tracking");
        
        // Don't actually stop locating, just hide the markers
        if (userLocationMarkerRef.current) {
          map.removeLayer(userLocationMarkerRef.current);
        }
        if (userLocationCircleRef.current) {
          map.removeLayer(userLocationCircleRef.current);
        }
        
        setIsTracking(false);
      }

      return () => {
        if (map) {
          // Clean up event handlers when component unmounts
          map.off('locationfound', handleLocationFound);
          map.off('locationerror', handleLocationError);
          
          // Clear watch position if using navigator
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
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
