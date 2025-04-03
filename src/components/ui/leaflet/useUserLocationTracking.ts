
import { useEffect, useRef } from 'react';
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

  // Handle location found event
  const handleLocationFound = (e: L.LocationEvent) => {
    if (!map) return;
    
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
    
    // Automatically open the popup when first locating
    userLocationMarkerRef.current.openPopup();

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
  };

  // Handle location error
  const handleLocationError = (e: L.ErrorEvent) => {
    console.error('Location error:', e.message);
    
    // Try to use navigator.geolocation as a fallback
    if (navigator.geolocation) {
      console.log("Trying fallback geolocation");
      navigator.geolocation.getCurrentPosition(
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
  };

  // Start or stop location tracking based on showUserLocation
  useEffect(() => {
    if (!map) return;
    
    // Set up event handlers
    map.on('locationfound', handleLocationFound);
    map.on('locationerror', handleLocationError);
    
    // This ensures we only start tracking once, and don't restart on every rerender
    // Only track when showUserLocation changes or when we haven't initialized tracking yet
    if (showUserLocation) {
      console.log("Starting location tracking");
      map.locate({ 
        setView: true, 
        maxZoom: 16, 
        watch: true,
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      });
      locationTrackingInitializedRef.current = true;
    } else if (locationTrackingInitializedRef.current) {
      // Only stop if tracking was previously initialized
      console.log("Stopping location tracking");
      map.stopLocate();
      
      // Remove location markers
      if (userLocationMarkerRef.current) {
        map.removeLayer(userLocationMarkerRef.current);
        userLocationMarkerRef.current = null;
      }
      if (userLocationCircleRef.current) {
        map.removeLayer(userLocationCircleRef.current);
        userLocationCircleRef.current = null;
      }
    }

    return () => {
      if (map) {
        // Clean up event handlers when component unmounts
        map.off('locationfound', handleLocationFound);
        map.off('locationerror', handleLocationError);
        map.stopLocate();
      }
    };
  }, [map, showUserLocation, setUserLocation]);

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
