
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
  const tilesRef = useRef<L.TileLayer | null>(null);

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
          zoomControl: true,
          attributionControl: true,
          fadeAnimation: true,
          zoomAnimation: true,
          markerZoomAnimation: true,
        });
        
        // Add a tile layer - using OpenStreetMap which doesn't require authentication
        tilesRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapRef.current);
        
        // Create a layer for markers
        markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
        
        // Mark the map as created
        setMapCreated(true);
        console.log("Map initialized successfully");
        
        // Reset initialization attempts
        mapInitializationAttempts.current = 0;
      } catch (error) {
        console.error("Error initializing map:", error);
        
        // Track failed attempts
        mapInitializationAttempts.current++;
        
        // If we've tried too many times, stop trying
        if (mapInitializationAttempts.current < 3) {
          console.log(`Retrying map initialization (attempt ${mapInitializationAttempts.current + 1})...`);
          setTimeout(initializeMap, 1000);
        } else {
          console.error("Failed to initialize map after multiple attempts");
        }
      }
    };

    // Initialize the map
    initializeMap();

    // Cleanup function
    return () => {
      if (mapRef.current) {
        try {
          console.log("Cleaning up map instance");
          
          // First remove layers
          if (markersLayerRef.current) {
            markersLayerRef.current.clearLayers();
            mapRef.current.removeLayer(markersLayerRef.current);
          }
          
          if (tilesRef.current) {
            mapRef.current.removeLayer(tilesRef.current);
          }
          
          // Then remove the map
          mapRef.current.remove();
          mapRef.current = null;
          markersLayerRef.current = null;
          tilesRef.current = null;
          
          setMapCreated(false);
        } catch (error) {
          console.error("Error cleaning up map:", error);
        }
      }
    };
  }, [mapContainerRef, center, zoom]);

  // Properly handle window resize for responsive maps
  useEffect(() => {
    const handleWindowResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  return {
    mapRef,
    markersLayerRef,
    mapCreated
  };
};

export default useMapInitialization;
