
import React, { useEffect, useState } from 'react';
import L from 'leaflet';

interface MapInitializerProps {
  mapContainerRef: React.RefObject<HTMLDivElement>;
  center: [number, number];
  zoom: number;
  onMapReady: (map: L.Map) => void;
  onInitError: (error: string) => void;
  mapInitializedRef: React.MutableRefObject<boolean>;
  initializationAttemptedRef: React.MutableRefObject<boolean>;
}

/**
 * Component responsible for initializing the Leaflet map
 */
const MapInitializer = ({
  mapContainerRef,
  center,
  zoom,
  onMapReady,
  onInitError,
  mapInitializedRef,
  initializationAttemptedRef
}: MapInitializerProps) => {
  useEffect(() => {
    // Only run initialization once
    if (!mapContainerRef.current || mapInitializedRef.current || initializationAttemptedRef.current) return;
    
    // Mark that we've attempted initialization
    initializationAttemptedRef.current = true;
    
    console.log('Initializing map base with center:', center, 'zoom:', zoom);
    
    try {
      // Force a minimum height to ensure container is visible
      if (mapContainerRef.current) {
        mapContainerRef.current.style.minHeight = '500px';
        mapContainerRef.current.style.height = '100%';
        mapContainerRef.current.style.width = '100%';
        mapContainerRef.current.style.backgroundColor = '#f0f0f0'; // Add background color to make container visible
      }
      
      // Add a delay to ensure the container is in the DOM and has dimensions
      const initMapWithDelay = setTimeout(() => {
        try {
          if (!mapContainerRef.current) {
            console.error("Map container ref is null");
            return;
          }
          
          // Make sure the map container is visible and has dimensions before creating the map
          if (mapContainerRef.current.clientHeight === 0) {
            console.warn("Map container has no height, forcing height");
            mapContainerRef.current.style.height = '500px';
            document.body.style.height = '100%';
            document.documentElement.style.height = '100%';
          }
          
          // Wait for layout to be calculated
          setTimeout(() => {
            try {
              if (!mapContainerRef.current) return;
              
              // Display the dimensions to help debug
              console.log(`Map container dimensions: ${mapContainerRef.current.clientWidth}x${mapContainerRef.current.clientHeight}`);
              
              // Create map with optimized settings
              const map = L.map(mapContainerRef.current, {
                center,
                zoom,
                zoomControl: true,
                preferCanvas: true,
                renderer: L.canvas({ padding: 0.5 }),
                attributionControl: true,
                // Ensure map doesn't try to do animations until fully ready
                fadeAnimation: false,
                zoomAnimation: false,
                markerZoomAnimation: false,
              });

              // Add OpenStreetMap tile layer with more conservative settings
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
              }).addTo(map);
              
              // Log that map initialization is complete
              console.log("Map base initialization complete");
              mapInitializedRef.current = true;
              
              // Wait a moment for the map to stabilize before triggering operations
              setTimeout(() => {
                if (map && document.body.contains(mapContainerRef.current)) {
                  try {
                    // Force a resize of the map
                    map.invalidateSize(true);
                    
                    // Notify parent that map is ready
                    console.log("Map is fully ready for operations");
                    onMapReady(map);
                  } catch (error) {
                    console.error("Error during map ready callback:", error);
                    onInitError(`Map ready callback error: ${error}`);
                  }
                }
              }, 500);
            } catch (err) {
              console.error('Error creating Leaflet map:', err);
              onInitError(`Map creation error: ${err}`);
            }
          }, 200);
        } catch (err) {
          console.error('Error in map initialization timeout:', err);
          onInitError(`Initialization timeout error: ${err}`);
        }
      }, 300);
      
      // Cleanup function will clear the timeout if the component unmounts
      return () => {
        clearTimeout(initMapWithDelay);
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      onInitError(error instanceof Error ? error.message : String(error));
    }
  }, [center, zoom, onMapReady, onInitError, mapContainerRef, mapInitializedRef, initializationAttemptedRef]);

  return null; // This is a non-visual component
};

export default MapInitializer;
