
import L from 'leaflet';
import { createPulsingIcon } from '../UserLocationMarker';
import { determineSafetyLevel } from '../utils/safetyAssessment';
import { addStreetLabels } from '../utils/streetLabels';
import { getZoomLevelForAccuracy } from '../utils/geoUtils';
import { dispatchLocationUpdate } from '../utils/locationEvents';

/**
 * Responsible for updating user location on the map
 */
export class LocationUpdater {
  private map: L.Map;
  private userMarkerRef: React.MutableRefObject<L.Marker | null>;
  private accuracyCircleRef: React.MutableRefObject<L.Circle | null>;
  private accuracyRef: React.MutableRefObject<number>;
  private latLngRef: React.MutableRefObject<L.LatLng | null>;
  private threatMarkers: any[];
  private streetLabelRef: React.MutableRefObject<L.Marker | null>;
  private safetyLevelRef: React.MutableRefObject<'safe' | 'caution' | 'danger'>;
  private setUserLocation?: (location: [number, number]) => void;

  constructor(
    map: L.Map,
    userMarkerRef: React.MutableRefObject<L.Marker | null>,
    accuracyCircleRef: React.MutableRefObject<L.Circle | null>,
    accuracyRef: React.MutableRefObject<number>,
    latLngRef: React.MutableRefObject<L.LatLng | null>,
    streetLabelRef: React.MutableRefObject<L.Marker | null>,
    safetyLevelRef: React.MutableRefObject<'safe' | 'caution' | 'danger'>,
    threatMarkers: any[],
    setUserLocation?: (location: [number, number]) => void
  ) {
    this.map = map;
    this.userMarkerRef = userMarkerRef;
    this.accuracyCircleRef = accuracyCircleRef;
    this.accuracyRef = accuracyRef;
    this.latLngRef = latLngRef;
    this.streetLabelRef = streetLabelRef;
    this.safetyLevelRef = safetyLevelRef;
    this.threatMarkers = threatMarkers;
    this.setUserLocation = setUserLocation;
  }

  /**
   * Update user location on the map
   */
  public updateLocation(e: L.LocationEvent): void {
    try {
      console.log("Updating location:", e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6), "accuracy:", e.accuracy);
      
      const radius = e.accuracy;
      this.accuracyRef.current = radius;
      this.latLngRef.current = e.latlng;
      
      // Remove existing markers if present
      this.removeExistingMarkers();
      
      // Determine safety level based on nearby threats
      if (this.threatMarkers && this.threatMarkers.length > 0) {
        this.safetyLevelRef.current = determineSafetyLevel(
          [e.latlng.lat, e.latlng.lng],
          this.threatMarkers
        );
      }
      
      // Add user location markers to map
      this.addLocationMarkers(e.latlng, radius);
      
      // Update parent component with location if callback provided
      if (this.setUserLocation) {
        this.setUserLocation([e.latlng.lat, e.latlng.lng]);
      }

      // Dispatch event for other components to respond
      dispatchLocationUpdate(e.latlng.lat, e.latlng.lng, radius, this.safetyLevelRef.current);
      
    } catch (error) {
      console.error("Error in updateLocation:", error);
    }
  }

  /**
   * Remove existing markers from the map
   */
  private removeExistingMarkers(): void {
    if (this.userMarkerRef.current) {
      try {
        this.map.removeLayer(this.userMarkerRef.current);
        this.userMarkerRef.current = null;
      } catch (error) {
        console.error("Error removing user marker:", error);
      }
    }
    
    if (this.accuracyCircleRef.current) {
      try {
        this.map.removeLayer(this.accuracyCircleRef.current);
        this.accuracyCircleRef.current = null;
      } catch (error) {
        console.error("Error removing accuracy circle:", error);
      }
    }
    
    if (this.streetLabelRef.current) {
      try {
        this.map.removeLayer(this.streetLabelRef.current);
        this.streetLabelRef.current = null;
      } catch (error) {
        console.error("Error removing street label:", error);
      }
    }
  }

  /**
   * Add user location markers to the map
   */
  private addLocationMarkers(latlng: L.LatLng, accuracy: number): void {
    try {
      // Create and add user location marker
      const pulsingIcon = createPulsingIcon(this.safetyLevelRef.current);
      this.userMarkerRef.current = L.marker(latlng, { icon: pulsingIcon })
        .addTo(this.map)
        .bindPopup(`
          <b>Your Exact Location</b><br>
          Lat: ${latlng.lat.toFixed(8)}<br>
          Lng: ${latlng.lng.toFixed(8)}<br>
          Accuracy: ±${accuracy < 1 ? accuracy.toFixed(2) : accuracy.toFixed(1)} meters
        `);

      // Color the accuracy circle based on safety level
      const circleColor = this.safetyLevelRef.current === 'safe' ? '#4F46E5' : 
                        this.safetyLevelRef.current === 'caution' ? '#F59E0B' : '#EF4444';
      
      // Add accuracy circle
      this.accuracyCircleRef.current = L.circle(latlng, {
        radius: accuracy,
        color: circleColor,
        fillColor: circleColor,
        fillOpacity: 0.1,
        weight: 2
      }).addTo(this.map);
      
      // Update street labels
      addStreetLabels(this.map, latlng, accuracy, this.streetLabelRef);
    } catch (error) {
      console.error("Error adding location markers:", error);
    }
  }
  
  /**
   * Center map on current user location
   */
  public centerMapOnLocation(highPrecision: boolean = false): void {
    if (!this.latLngRef.current) return;
    
    try {
      const zoomLevel = getZoomLevelForAccuracy(this.accuracyRef.current);
      this.map.setView(this.latLngRef.current, zoomLevel, { animate: true });
      
      // Update street labels
      addStreetLabels(
        this.map, 
        this.latLngRef.current, 
        this.accuracyRef.current, 
        this.streetLabelRef
      );
    } catch (error) {
      console.error("Error centering map on location:", error);
    }
  }
}
