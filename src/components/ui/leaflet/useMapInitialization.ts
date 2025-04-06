
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
          minZoom: 3,
          maxZoom: 19,
          zoomControl: true,
          attributionControl: true,
          preferCanvas: true // Better performance for markers
        });
        
        // Add the detailed OpenStreetMap tile layer for better street names
        tilesRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          className: 'map-tiles', // Add class for potential CSS targeting
        }).addTo(mapRef.current);
        
        // Create a layer group for the markers
        markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
        
        // Add scale control to show distances
        L.control.scale().addTo(mapRef.current);
        
        // Add zoom control in a specific position
        L.control.zoom({
          position: 'bottomright'
        }).addTo(mapRef.current);
        
        // Setup event listeners
        mapRef.current.on('load', () => {
          console.log("Map load event fired");
          setMapCreated(true);
        });
        
        mapRef.current.on('zoomend', () => {
          console.log(`Map zoom changed to ${mapRef.current?.getZoom()}`);
        });
        
        // Listen for high precision mode to switch to detailed tiles
        document.addEventListener('highPrecisionModeActivated', handleHighPrecision);
        
        // Ensure the map is properly sized
        setTimeout(() => {
          if (mapRef.current) {
            window.dispatchEvent(new Event('resize'));
            mapRef.current.invalidateSize(true);
            
            // Force another resize after animation frames have completed
            requestAnimationFrame(() => {
              setTimeout(() => {
                if (mapRef.current) {
                  mapRef.current.invalidateSize(true);
                  setMapCreated(true);
                  console.log("Map initialized successfully");
                }
              }, 100);
            });
          }
        }, 200);
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
    
    // Function to switch to high-precision tiles
    const handleHighPrecision = () => {
      console.log("High precision mode activated for map tiles");
      try {
        if (mapRef.current && tilesRef.current) {
          // For high precision, use a more detailed tile layer
          mapRef.current.removeLayer(tilesRef.current);
          
          // Use Stadia Maps for more detailed street views
          tilesRef.current = L.tileLayer('https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 20,
            className: 'map-tiles-high-precision',
          }).addTo(mapRef.current);
          
          // Ensure map is correctly sized after tile change
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.invalidateSize(true);
            }
          }, 100);
        }
      } catch (error) {
        console.error("Error switching to high-precision tiles:", error);
      }
    };
    
    // Initialize the map
    initializeMap();
    
    // Update map view if center or zoom changes
    if (mapRef.current && mapCreated) {
      mapRef.current.setView(center, zoom);
    }

    return () => {
      // Remove event listeners
      document.removeEventListener('highPrecisionModeActivated', handleHighPrecision);
      
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
