
import L from 'leaflet';
import { LocationMarkerManager } from './LocationMarkerManager';
import { determineSafetyLevel } from '../safetyAssessment';
import { getZoomLevelForAccuracy } from '../geoUtils';
import { dispatchLocationUpdate } from '../locationEvents';

interface LocationUpdaterOptions {
  map: L.Map;
  markerManager: LocationMarkerManager;
  userLocationLatLngRef: React.MutableRefObject<L.LatLng | null>;
  userLocationAccuracyRef: React.MutableRefObject<number>;
  safetyLevelRef: React.MutableRefObject<'safe' | 'caution' | 'danger'>;
  locationTrackingInitializedRef: React.MutableRefObject<boolean>;
  highPrecisionModeRef: React.MutableRefObject<boolean>;
  threatMarkers: any[];
  setUserLocation?: (location: [number, number]) => void;
  lastEventTimeRef: React.MutableRefObject<number>;
}

/**
 * Handles location updates and map interactions
 */
export class LocationUpdater {
  private options: LocationUpdaterOptions;

  constructor(options: LocationUpdaterOptions) {
    this.options = options;
  }

  /**
   * Handle location updates from the map or geolocation API
   */
  public updateLocation = (e: L.LocationEvent): void => {
    try {
      const { 
        map, 
        markerManager,
        userLocationAccuracyRef,
        userLocationLatLngRef,
        safetyLevelRef,
        locationTrackingInitializedRef,
        highPrecisionModeRef,
        threatMarkers,
        setUserLocation,
        lastEventTimeRef
      } = this.options;
      
      // Debounce frequent updates
      const now = Date.now();
      if (now - lastEventTimeRef.current < 300) {
        return;
      }
      lastEventTimeRef.current = now;
      
      console.log("Location update:", e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6), "accuracy:", e.accuracy);
      
      // Update references
      userLocationAccuracyRef.current = e.accuracy;
      userLocationLatLngRef.current = e.latlng;
      
      // Determine safety level based on nearby threats
      if (threatMarkers && threatMarkers.length > 0) {
        safetyLevelRef.current = determineSafetyLevel(
          [e.latlng.lat, e.latlng.lng],
          threatMarkers
        );
      }
      
      // Update markers
      markerManager.updateMarker(e.latlng, e.accuracy, safetyLevelRef.current);
      
      // Set view if in high precision mode or first initialization
      if (highPrecisionModeRef.current || !locationTrackingInitializedRef.current) {
        const zoomLevel = getZoomLevelForAccuracy(e.accuracy);
        map.setView(e.latlng, zoomLevel, { animate: true });
        
        if (locationTrackingInitializedRef.current) {
          highPrecisionModeRef.current = false;
        }
      }
      
      locationTrackingInitializedRef.current = true;
      
      // Update parent component with location if callback provided
      if (setUserLocation) {
        setUserLocation([e.latlng.lat, e.latlng.lng]);
      }

      // Dispatch event for other components
      dispatchLocationUpdate(e.latlng.lat, e.latlng.lng, e.accuracy, safetyLevelRef.current);
      
    } catch (error) {
      console.error("Error in updateLocation:", error);
    }
  };

  /**
   * Center map on current user location
   */
  public centerMapOnLocation = (): void => {
    const { 
      map, 
      userLocationLatLngRef, 
      userLocationAccuracyRef,
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
      const zoomLevel = getZoomLevelForAccuracy(userLocationAccuracyRef.current);
      map.setView(userLocationLatLngRef.current, zoomLevel, { animate: true });
    }
  };
}
