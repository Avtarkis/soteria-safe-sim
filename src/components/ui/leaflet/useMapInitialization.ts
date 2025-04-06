
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

export const useMapInitialization = (
  mapContainerRef: React.RefObject<HTMLDivElement>,
  center: [number, number],
  zoom: number
) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [mapCreated, setMapCreated] = useState(false);
  const mapInitializationAttempts = useRef(0);

  useEffect(() => {
    if (!mapContainerRef.current) {
      console.warn("Map container ref is not available yet");
      return;
    }

    const initializeMap = () => {
      try {
        console.log("Initializing map...");
        
        // If an attempt to initialize the map was already made, try cleanup first
        if (mapRef.current) {
          console.log("Removing previous map instance");
          mapRef.current.remove();
          mapRef.current = null;
        }
        
        // Create a new map instance
        mapRef.current = L.map(mapContainerRef.current, {
          center: center,
          zoom: zoom,
          minZoom: 3,
          maxZoom: 19,
          zoomControl: true,
          attributionControl: true
        });
        
        // Add the detailed OpenStreetMap tile layer for better street names
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapRef.current);
        
        // Create a layer group for the markers
        markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
        
        // Add scale control to show distances
        L.control.scale().addTo(mapRef.current);
        
        // Ensure the map is properly sized
        setTimeout(() => {
          if (mapRef.current) {
            window.dispatchEvent(new Event('resize'));
            mapRef.current.invalidateSize(true);
          }
        }, 200);
        
        setMapCreated(true);
        console.log("Map initialized successfully");
      } catch (error) {
        console.error("Error initializing map:", error);
        mapInitializationAttempts.current += 1;
        
        // Try again if we haven't tried too many times already
        if (mapInitializationAttempts.current < 3) {
          console.log(`Retrying map initialization (attempt ${mapInitializationAttempts.current + 1})...`);
          setTimeout(initializeMap, 1000);
        }
      }
    };
    
    // Initialize the map
    initializeMap();
    
    // Update map view if center or zoom changes
    if (mapRef.current && mapCreated) {
      mapRef.current.setView(center, zoom);
    }

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.stopLocate(); // Stop watching location
          mapRef.current.remove(); // Remove map instance
          mapRef.current = null;
        } catch (error) {
          console.error("Error cleaning up map:", error);
        }
      }
    };
  }, [center, zoom, mapContainerRef]);

  return {
    mapRef,
    markersLayerRef,
    mapCreated
  };
};

export default useMapInitialization;
