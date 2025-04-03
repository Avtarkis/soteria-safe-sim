
import React from 'react';
import L from 'leaflet';
import { ThreatMarker } from '@/types/threats';

interface ThreatMarkersProps {
  map: L.Map;
  markersLayer: L.LayerGroup;
  markers: ThreatMarker[];
  onMarkerClick?: (marker: ThreatMarker) => void;
}

const ThreatMarkers: React.FC<ThreatMarkersProps> = ({ 
  map, 
  markersLayer, 
  markers, 
  onMarkerClick 
}) => {
  // Clear existing markers
  markersLayer.clearLayers();

  // Add new markers
  markers.forEach(marker => {
    // Set marker color based on threat level and type
    let markerColor = marker.level === 'high' ? 'red' : 
                     marker.level === 'medium' ? 'orange' : 'blue';
    
    // Adjust color based on threat type if specified
    if (marker.type) {
      if (marker.type === 'cyber') {
        markerColor = marker.level === 'high' ? '#ff3399' : 
                     marker.level === 'medium' ? '#ff66b2' : '#ff99cc';
      } else if (marker.type === 'environmental') {
        markerColor = marker.level === 'high' ? '#33cc33' : 
                     marker.level === 'medium' ? '#66cc66' : '#99cc99';
      }
      // physical threats use the default red/orange/blue scheme
    }
    
    // Create circle marker with appropriate styling based on threat level
    const circleRadius = marker.level === 'high' ? 20 : 
                        marker.level === 'medium' ? 15 : 10;
    
    // Add threat zone visualization (circle)
    const circle = L.circle(marker.position, {
      color: markerColor,
      fillColor: markerColor,
      fillOpacity: 0.2,
      radius: circleRadius * 50 // Scaled for visibility
    }).addTo(markersLayer);
    
    // Add marker at the center of threat zone
    const icon = L.divIcon({
      className: `threat-marker-${marker.level}`,
      html: `<div style="background-color: ${markerColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    
    const mapMarker = L.marker(marker.position, { icon }).addTo(markersLayer);
    
    // Add popup with basic info
    const threatType = marker.type ? `<br>${marker.type.toUpperCase()} threat` : '';
    mapMarker.bindPopup(`<b>${marker.title}</b><br>${marker.level.toUpperCase()} threat level${threatType}`);
    
    // Add click handler
    if (onMarkerClick) {
      mapMarker.on('click', () => onMarkerClick(marker));
      circle.on('click', () => onMarkerClick(marker));
    }
  });
  
  return null;
};

export default ThreatMarkers;
