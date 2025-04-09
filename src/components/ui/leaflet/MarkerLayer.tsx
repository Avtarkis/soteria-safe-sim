
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
  const previousMarkersRef = useRef<string>('');
  const [error, setError] = useState<string | null>(null);
  const markersAddedRef = useRef<boolean>(false);
  
  // Create and manage marker layer with improved error handling
  useEffect(() => {
    // Skip if map is not initialized or markers already processed
    if (!map) return;
    
    // Ensure map container is ready before proceeding
    if (!map.getContainer() || !document.body.contains(map.getContainer())) {
      console.warn("Map container is not ready for markers");
      return;
    }
    
    // Give the map a moment to stabilize before adding markers
    const timeoutId = setTimeout(() => {
      try {
        console.log(`Preparing to update ${markers.length} markers`);
        
        // Skip update if markers haven't changed (prevent flicker)
        const markersJSON = JSON.stringify(markers.map(m => `${m.position[0]}-${m.position[1]}-${m.level}`));
        if (markersJSON === previousMarkersRef.current && markerLayerRef.current) {
          console.log("Markers unchanged, skipping update");
          return;
        }
        
        previousMarkersRef.current = markersJSON;
        
        // Create a new layer group if it doesn't exist
        if (!markerLayerRef.current) {
          console.log("Creating new marker layer group");
          markerLayerRef.current = L.layerGroup();
          
          // Make sure map has been properly initialized before adding layer
          map.whenReady(() => {
            try {
              if (map && map.getContainer() && document.body.contains(map.getContainer())) {
                markerLayerRef.current?.addTo(map);
                console.log("Added marker layer group to map");
              }
            } catch (error) {
              console.error("Error adding layer group to map:", error);
            }
          });
        }
        
        // Get current layer group
        const markerLayer = markerLayerRef.current;
        if (!markerLayer) return;
        
        // Clear existing markers from the layer
        try {
          markerLayer.clearLayers();
          console.log("Cleared existing markers");
        } catch (error) {
          console.error("Error clearing markers:", error);
          setError("Failed to clear markers");
          return;
        }
        
        // Wait until map is fully rendered before adding markers
        map.whenReady(() => {
          // Double check if map is still valid
          if (!map || !map.getContainer() || !document.body.contains(map.getContainer())) {
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
              
              // Create marker directly on the layer instead of adding after creation
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
              
              // Add to marker layer
              try {
                markerLayer.addLayer(leafletMarker);
                addedMarkers.push(leafletMarker);
              } catch (error) {
                console.error(`Error adding marker ${index}:`, error);
              }
              
            } catch (error) {
              console.error(`Error adding marker ${index}:`, error);
            }
          });
          
          console.log(`Successfully added ${addedMarkers.length} markers`);
          setError(null);
          markersAddedRef.current = true;
        });
      } catch (error) {
        console.error("Error managing marker layer:", error);
        setError("Failed to update markers");
      }
    }, 800); // Increased timeout to ensure map is fully initialized
    
    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      
      try {
        if (map && markerLayerRef.current) {
          // First check if map still exists and if the layer is on the map
          if (map.hasLayer(markerLayerRef.current)) {
            map.removeLayer(markerLayerRef.current);
            console.log("Removed marker layer during cleanup");
          }
          markerLayerRef.current = null;
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
