
import L from 'leaflet';
import { createPulsingIcon } from '../UserLocationMarker';
import { determineSafetyLevel } from './safetyAssessment';
import { addStreetLabels } from './streetLabels';
import { getZoomLevelForAccuracy } from './geoUtils';
import { dispatchLocationUpdate } from './locationEvents';

interface LocationHandlerOptions {
  map: L.Map;
  userLocationMarkerRef: React.MutableRefObject<L.Marker | null>;
  userLocationCircleRef: React.MutableRefObject<L.Circle | null>;
  userLocationAccuracyRef: React.MutableRefObject<number>;
  userLocationLatLngRef: React.MutableRefObject<L.LatLng | null>;
  streetLabelRef: React.MutableRefObject<L.Marker | null>;
  highPrecisionModeRef: React.MutableRefObject<boolean>;
  safetyLevelRef: React.MutableRefObject<'safe' | 'caution' | 'danger'>;
  locationTrackingInitializedRef: React.MutableRefObject<boolean>;
  threatMarkers: any[];
  setUserLocation?: (location: [number, number]) => void;
  errorCountRef: React.MutableRefObject<number>;
  lastEventTimeRef: React.MutableRefObject<number>;
}

export class LocationHandler {
  private options: LocationHandlerOptions;

  constructor(options: LocationHandlerOptions) {
    this.options = options;
  }

  /**
   * Handle location updates from the map or geolocation API
   */
  public handleLocationFound = (e: L.LocationEvent): void => {
    try {
      const { 
        map, 
        userLocationMarkerRef, 
        userLocationCircleRef, 
        userLocationAccuracyRef,
        userLocationLatLngRef,
        streetLabelRef,
        highPrecisionModeRef,
        safetyLevelRef,
        locationTrackingInitializedRef,
        threatMarkers,
        setUserLocation,
        errorCountRef,
        lastEventTimeRef
      } = this.options;
      
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
      this.options.errorCountRef.current++;
      
      // Stop location tracking if too many errors
      if (this.options.errorCountRef.current > 5) {
        console.error("Too many errors during location tracking, stopping to prevent crashes");
        this.stopAllLocationTracking();
      }
    }
  };

  /**
   * Handle location errors from the map API
   */
  public handleLocationError = (e: L.ErrorEvent, watchIdRef: React.MutableRefObject<number | null>): void => {
    console.error('Location error:', e.message);
    
    // Try fallback to browser geolocation API
    if (navigator.geolocation && watchIdRef.current === null) {
      console.log("Trying fallback geolocation with high accuracy");
      this.startFallbackGeolocation(watchIdRef);
    }
  };

  /**
   * Start fallback geolocation using browser API
   */
  private startFallbackGeolocation(watchIdRef: React.MutableRefObject<number | null>): void {
    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          if (!this.options.map) return;
          
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
          
          this.handleLocationFound(locationEvent);
        },
        (error) => {
          console.error('Geolocation error:', error.message);
          this.options.errorCountRef.current++;
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

  /**
   * Stop all location tracking
   */
  public stopAllLocationTracking = (watchIdRef?: React.MutableRefObject<number | null>): void => {
    try {
      const { map } = this.options;
      
      if (map && map.stopLocate) {
        map.stopLocate();
      }
      
      if (watchIdRef && watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    } catch (e) {
      console.error("Error stopping location services:", e);
    }
  };

  /**
   * Center map on current user location
   */
  public centerMapOnUserLocation = (): void => {
    const { 
      map, 
      userLocationLatLngRef, 
      userLocationAccuracyRef,
      streetLabelRef, 
      highPrecisionModeRef 
    } = this.options;
    
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
}
