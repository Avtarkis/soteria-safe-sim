
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ThreatMarker } from '@/types/threats';

interface MarkerLayerProps {
  map: L.Map;
  markers: ThreatMarker[];
  onMarkerClick?: (marker: ThreatMarker) => void;
}

const MarkerLayer = ({ map, markers, onMarkerClick }: MarkerLayerProps) => {
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  
  // Create and manage marker layer
  useEffect(() => {
    // Check if map is initialized
    if (!map) return;
    
    // Create a new layer group if it doesn't exist
    if (!markerLayerRef.current) {
      markerLayerRef.current = L.layerGroup().addTo(map);
    }
    
    // Get current layer group
    const markerLayer = markerLayerRef.current;
    
    // Clear existing markers from the layer
    try {
      // Clear any existing markers
      markerLayer.clearLayers();
      
      // Add all markers to the layer
      markers.forEach(marker => {
        try {
          const { position, level, title, details } = marker;
          
          // Determine marker color based on threat level
          const markerColor = level === 'high' ? 'red' : 
                              level === 'medium' ? 'orange' : 'blue';
          
          // Create custom icon for marker
          const icon = L.divIcon({
            className: `custom-marker ${level}-marker`,
            html: `<div style="background-color: ${markerColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          });
          
          // Create and add marker to layer
          const leafletMarker = L.marker(position, { icon }).addTo(markerLayer);
          
          // Add popup with threat details
          leafletMarker.bindPopup(`
            <div class="threat-popup">
              <h3>${title}</h3>
              <p>${details}</p>
              <span class="threat-level ${level}">Risk Level: ${level.toUpperCase()}</span>
            </div>
          `);
          
          // Add click handler if provided
          if (onMarkerClick) {
            leafletMarker.on('click', () => {
              onMarkerClick(marker);
            });
          }
        } catch (error) {
          console.error("Error adding marker:", error);
        }
      });
    } catch (error) {
      console.error("Error managing marker layer:", error);
    }
    
    // Cleanup function
    return () => {
      try {
        if (map && markerLayerRef.current) {
          // First check if map still exists and if the layer is on the map
          if (map.hasLayer(markerLayerRef.current)) {
            map.removeLayer(markerLayerRef.current);
          }
          markerLayerRef.current = null;
        }
      } catch (error) {
        console.error("Error cleaning up marker layer:", error);
        markerLayerRef.current = null;
      }
    };
  }, [map, markers, onMarkerClick]);
  
  return null; // This is a non-visual component that manipulates the map
};

export default MarkerLayer;
