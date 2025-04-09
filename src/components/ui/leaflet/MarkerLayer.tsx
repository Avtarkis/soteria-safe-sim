
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ThreatMarker } from '@/types/threats';

interface MarkerLayerProps {
  map: L.Map;
  markers: ThreatMarker[];
  onMarkerClick?: (marker: ThreatMarker) => void;
}

const MarkerLayer = ({ map, markers, onMarkerClick }: MarkerLayerProps) => {
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const markersReadyRef = useRef<boolean>(false);
  const previousMarkersRef = useRef<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Create and manage marker layer with improved error handling
  useEffect(() => {
    // Skip if map is not initialized
    if (!map) return;
    
    // Check if the map DOM node is still valid
    if (!map.getContainer() || map.getContainer().clientHeight === 0) {
      console.warn("Map container is not ready for markers");
      return;
    }
    
    console.log(`Preparing to update ${markers.length} markers`);
    
    // Skip update if markers haven't changed (prevent flicker)
    const markersJSON = JSON.stringify(markers.map(m => `${m.position[0]}-${m.position[1]}-${m.level}`));
    if (markersJSON === previousMarkersRef.current && markerLayerRef.current) {
      console.log("Markers unchanged, skipping update");
      return;
    }
    
    previousMarkersRef.current = markersJSON;
    
    try {
      // Create a new layer group if it doesn't exist
      if (!markerLayerRef.current) {
        console.log("Creating new marker layer group");
        markerLayerRef.current = L.layerGroup();
        
        // Only add to map if the map is valid
        if (map && map.getContainer() && map.getContainer().clientHeight > 0) {
          markerLayerRef.current.addTo(map);
        } else {
          console.warn("Map container not ready, delaying marker layer addition");
          return;
        }
      }
      
      // Get current layer group
      const markerLayer = markerLayerRef.current;
      
      // Clear existing markers from the layer
      try {
        // Clear any existing markers
        markerLayer.clearLayers();
        console.log("Cleared existing markers");
      } catch (error) {
        console.error("Error clearing markers:", error);
        setError("Failed to clear markers");
        return;
      }
      
      // Check if the map is in a state where we can add markers
      if (!map || !map.getContainer() || map.getContainer().clientHeight === 0) {
        console.warn("Map not ready for marker addition");
        return;
      }
      
      // Add all markers to the layer
      const addedMarkers: L.Marker[] = [];
      
      markers.forEach((marker, index) => {
        try {
          const { position, level, title, details } = marker;
          
          // Skip invalid positions
          if (!position || position.length !== 2 || isNaN(position[0]) || isNaN(position[1])) {
            console.warn(`Skipping marker with invalid position: ${JSON.stringify(position)}`);
            return;
          }
          
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
          
          // Create marker
          const leafletMarker = L.marker(position, { icon });
          
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
          
          // Add to layer group
          leafletMarker.addTo(markerLayer);
          addedMarkers.push(leafletMarker);
          
        } catch (error) {
          console.error(`Error adding marker ${index}:`, error);
        }
      });
      
      console.log(`Successfully added ${addedMarkers.length} markers`);
      markersReadyRef.current = true;
      setError(null);
      
    } catch (error) {
      console.error("Error managing marker layer:", error);
      setError("Failed to update markers");
    }
    
    // Cleanup function
    return () => {
      try {
        if (map && markerLayerRef.current) {
          // First check if map still exists and if the layer is on the map
          if (map.hasLayer(markerLayerRef.current)) {
            map.removeLayer(markerLayerRef.current);
            console.log("Removed marker layer during cleanup");
          }
          markerLayerRef.current = null;
          markersReadyRef.current = false;
        }
      } catch (error) {
        console.error("Error cleaning up marker layer:", error);
        markerLayerRef.current = null;
      }
    };
  }, [map, markers, onMarkerClick]);
  
  // If we had an error, we could render something here, but for now we'll return null
  return null; // This is a non-visual component that manipulates the map
};

export default MarkerLayer;
