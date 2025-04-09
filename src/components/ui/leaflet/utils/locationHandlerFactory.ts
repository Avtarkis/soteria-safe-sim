
import L from 'leaflet';
import { MutableRefObject } from 'react';
import { ThreatMarker } from '@/types/threats';

export type LocationHandlerConfig = {
  map: L.Map;
  userLocationMarkerRef: MutableRefObject<L.Marker | null>;
  userLocationCircleRef: MutableRefObject<L.Circle | null>;
  userLocationAccuracyRef: MutableRefObject<number>;
  userLocationLatLngRef: MutableRefObject<L.LatLng | null>;
  streetLabelRef: MutableRefObject<L.Marker | null>;
  highPrecisionModeRef: MutableRefObject<boolean>;
  safetyLevelRef: MutableRefObject<'safe' | 'caution' | 'danger'>;
  locationTrackingInitializedRef: MutableRefObject<boolean>;
  threatMarkers: ThreatMarker[];
  setUserLocation: ((location: [number, number] | null) => void) | undefined;
  errorCountRef: MutableRefObject<number>;
  lastEventTimeRef: MutableRefObject<number>;
};

export const createLocationHandler = (config: LocationHandlerConfig) => {
  const {
    map,
    userLocationMarkerRef,
    userLocationCircleRef,
    userLocationAccuracyRef,
    userLocationLatLngRef,
    streetLabelRef,
    locationTrackingInitializedRef,
    threatMarkers,
    setUserLocation,
    errorCountRef,
    lastEventTimeRef
  } = config;

  /**
   * Handles successful location updates
   */
  const handleLocationFound = (e: L.LocationEvent | GeolocationPosition) => {
    try {
      // Normalize event format between Leaflet and browser APIs
      const latlng = 'latlng' in e 
        ? e.latlng 
        : L.latLng(e.coords.latitude, e.coords.longitude);
      
      const accuracy = 'accuracy' in e 
        ? e.accuracy 
        : e.coords.accuracy;
      
      // Rate limiting to prevent too frequent updates (once per second)
      const now = Date.now();
      if (now - lastEventTimeRef.current < 1000) {
        return;
      }
      lastEventTimeRef.current = now;
      
      // Store the current position
      userLocationLatLngRef.current = latlng;
      userLocationAccuracyRef.current = accuracy;
      
      // Update external state if callback provided
      if (setUserLocation) {
        setUserLocation([latlng.lat, latlng.lng]);
      }
      
      // Create or update the accuracy circle
      if (userLocationCircleRef.current) {
        userLocationCircleRef.current.setLatLng(latlng);
        userLocationCircleRef.current.setRadius(accuracy);
      } else {
        userLocationCircleRef.current = L.circle(latlng, {
          radius: accuracy,
          weight: 1,
          color: '#0284c7',
          fillColor: '#0284c7',
          fillOpacity: 0.15,
          interactive: false
        }).addTo(map);
      }
      
      // Create or update the user marker
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.setLatLng(latlng);
      } else {
        const icon = L.divIcon({
          className: 'user-location-marker',
          html: `<div class="pulse-dot"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        
        userLocationMarkerRef.current = L.marker(latlng, {
          icon,
          zIndexOffset: 1000,
          interactive: false
        }).addTo(map);
      }
      
      locationTrackingInitializedRef.current = true;
      
    } catch (error) {
      console.error("Error handling location found:", error);
    }
  };
  
  /**
   * Handles location errors
   */
  const handleLocationError = (e: L.ErrorEvent, watchIdRef: MutableRefObject<number | null>) => {
    console.error("Location error:", e.message);
    
    errorCountRef.current++;
    
    // If we get multiple errors, stop and restart tracking
    if (errorCountRef.current > 3) {
      try {
        // Clean up and restart
        if (map.stopLocate) {
          map.stopLocate();
        }
        
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        
        // Try again after a delay
        setTimeout(() => {
          errorCountRef.current = 0;
          map.locate({ 
            setView: false,
            maxZoom: 19, 
            watch: true,
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        }, 5000);
      } catch (restartError) {
        console.error("Error restarting location tracking:", restartError);
      }
    }
  };
  
  /**
   * Centers the map on the user's current location
   */
  const centerMapOnUserLocation = () => {
    if (!map || !userLocationLatLngRef.current) {
      console.log("Cannot center map: no map or user location available");
      return;
    }
    
    try {
      map.setView(userLocationLatLngRef.current, 16, {
        animate: true,
        duration: 1
      });
    } catch (error) {
      console.error("Error centering map on user location:", error);
    }
  };
  
  return {
    handleLocationFound,
    handleLocationError,
    centerMapOnUserLocation
  };
};
