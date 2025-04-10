
import L from 'leaflet';
import { createPulsingIcon } from '../../UserLocationMarker';
import { addStreetLabels } from '../streetLabels';

interface MarkerOptions {
  map: L.Map;
  markerRef: React.MutableRefObject<L.Marker | null>;
  circleRef: React.MutableRefObject<L.Circle | null>;
  streetLabelRef: React.MutableRefObject<L.Marker | null>;
}

/**
 * Manages user location markers on the map
 */
export class LocationMarkerManager {
  private options: MarkerOptions;

  constructor(options: MarkerOptions) {
    this.options = options;
  }

  /**
   * Create or update user location marker
   */
  public updateMarker(latlng: L.LatLng, accuracy: number, safetyLevel: 'safe' | 'caution' | 'danger'): void {
    try {
      const { map, markerRef, circleRef, streetLabelRef } = this.options;
      
      // Remove existing markers
      this.removeMarkers();
      
      // Create pulsing icon based on safety level
      const pulsingIcon = createPulsingIcon(safetyLevel);
      
      // Add user location marker
      markerRef.current = L.marker(latlng, { icon: pulsingIcon })
        .addTo(map)
        .bindPopup(`
          <b>Your Exact Location</b><br>
          Lat: ${latlng.lat.toFixed(8)}<br>
          Lng: ${latlng.lng.toFixed(8)}<br>
          Accuracy: ±${accuracy < 1 ? accuracy.toFixed(2) : accuracy.toFixed(1)} meters
        `);

      // Choose circle color based on safety level
      const circleColor = safetyLevel === 'safe' ? '#4F46E5' : 
                         safetyLevel === 'caution' ? '#F59E0B' : '#EF4444';
      
      // Add accuracy circle
      circleRef.current = L.circle(latlng, {
        radius: accuracy,
        color: circleColor,
        fillColor: circleColor,
        fillOpacity: 0.1,
        weight: 2
      }).addTo(map);
      
      // Update street labels
      addStreetLabels(map, latlng, accuracy, streetLabelRef);
    } catch (error) {
      console.error("Error updating location marker:", error);
    }
  }

  /**
   * Remove all markers from the map
   */
  public removeMarkers(): void {
    const { map, markerRef, circleRef, streetLabelRef } = this.options;
    
    if (markerRef.current && map.hasLayer(markerRef.current)) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    
    if (circleRef.current && map.hasLayer(circleRef.current)) {
      map.removeLayer(circleRef.current);
      circleRef.current = null;
    }
    
    if (streetLabelRef.current && map.hasLayer(streetLabelRef.current)) {
      map.removeLayer(streetLabelRef.current);
      streetLabelRef.current = null;
    }
  }
}
