
import React, { useEffect } from 'react';
import L from 'leaflet';
import { ThreatMarker } from '@/types/threats';

interface MarkersLayerProps {
  map: L.Map | null;
  markers: ThreatMarker[];
  onMarkerClick?: (marker: ThreatMarker) => void;
}

/**
 * Component to render threat markers on the map
 */
const MarkersLayer = ({ map, markers, onMarkerClick }: MarkersLayerProps) => {
  useEffect(() => {
    if (!map || !markers.length) return;
    
    console.log(`Adding ${markers.length} markers to map`);
    const markerLayers: L.Marker[] = [];
    
    markers.forEach(marker => {
      try {
        const markerIcon = L.divIcon({
          className: `threat-marker threat-level-${marker.level}`,
          html: `<div class="marker-icon"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        
        const markerInstance = L.marker(marker.position, { icon: markerIcon })
          .addTo(map);
          
        if (onMarkerClick) {
          markerInstance.on('click', () => onMarkerClick(marker));
        }
        
        markerLayers.push(markerInstance);
      } catch (error) {
        console.error("Error adding marker:", error);
      }
    });
    
    return () => {
      markerLayers.forEach(markerInstance => {
        if (map.hasLayer(markerInstance)) {
          map.removeLayer(markerInstance);
        }
      });
    };
  }, [map, markers, onMarkerClick]);
  
  return null; // This is a non-visual component
};

export default MarkersLayer;
