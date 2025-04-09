
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';

// Fix marker icon issues - explicitly set the icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapBaseProps {
  className?: string;
  center: [number, number];
  zoom: number;
  onMapReady: (map: L.Map) => void;
}

const MapBase = ({
  className,
  center,
  zoom,
  onMapReady
}: MapBaseProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const mapInitializedRef = useRef(false);
  const initializationAttemptedRef = useRef(false);
  const [initError, setInitError] = useState<string | null>(null);
  
  // Initialize map when component mounts with more defensive checks
  useEffect(() => {
    // Only run initialization once
    if (!mapContainerRef.current || mapInitializedRef.current || initializationAttemptedRef.current) return;
    
    // Mark that we've attempted initialization
    initializationAttemptedRef.current = true;
    
    try {
      console.log('Initializing map base with center:', center, 'zoom:', zoom);
      
      // Force a minimum height to ensure container is visible
      if (mapContainerRef.current) {
        mapContainerRef.current.style.minHeight = '500px';
        mapContainerRef.current.style.height = '100%';
        mapContainerRef.current.style.width = '100%';
        mapContainerRef.current.style.backgroundColor = '#f0f0f0'; // Add background color to make container visible
      }
      
      // Verify that the container exists and has dimensions before proceeding
      if (!mapContainerRef.current || !mapContainerRef.current.clientHeight) {
        // If container isn't ready yet, retry initialization after a delay
        setTimeout(() => {
          initializationAttemptedRef.current = false; // Reset flag to allow another attempt
          if (mapContainerRef.current) mapContainerRef.current.style.minHeight = '500px';
        }, 300);
        return;
      }
      
      // Add a small delay to ensure DOM is fully ready
      setTimeout(() => {
        try {
          if (!mapContainerRef.current) return;
          
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

          // Add basic controls
          L.control.attribution({
            prefix: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
            position: 'bottomright'
          }).addTo(map);
          
          L.control.zoom({
            position: 'bottomright'
          }).addTo(map);

          // Add OpenStreetMap tile layer with more conservative settings
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
          }).addTo(map);
          
          // Wait for tiles to load before proceeding
          map.once('load', () => {
            console.log("Map tiles loaded");
          });
          
          // Store ref
          mapRef.current = map;
          
          // Extra delay to ensure map is properly initialized before operations
          setTimeout(() => {
            if (mapRef.current) {
              try {
                // First invalidate size forcefully
                mapRef.current.invalidateSize(true);
                
                // Set view with no animations initially
                mapRef.current.setView(center, zoom, { animate: false, duration: 0 });
                
                // Then notify parent that map is ready
                console.log("Map base initialization complete");
                mapInitializedRef.current = true;
                
                // Wait for DOM to fully process the map
                setTimeout(() => {
                  // Enable animations after map is stable
                  if (mapRef.current) {
                    (mapRef.current.options as any).fadeAnimation = true;
                    (mapRef.current.options as any).zoomAnimation = true;
                    (mapRef.current.options as any).markerZoomAnimation = true;
                    
                    mapRef.current.invalidateSize(true);
                    console.log("Map is fully ready for operations");
                    
                    // Finally notify parent with the ready map
                    onMapReady(mapRef.current);
                  }
                }, 500);
              } catch (error) {
                console.error("Error during map initialization:", error);
                setInitError(`Map init error: ${error}`);
              }
            }
          }, 300);
        } catch (err) {
          console.error('Error creating Leaflet map:', err);
          setInitError(`Map creation error: ${err}`);
        }
      }, 500); // Longer delay to ensure DOM is ready
      
    } catch (error) {
      console.error('Error initializing map:', error);
      setInitError(error instanceof Error ? error.message : String(error));
    }
    
    // Cleanup when component unmounts
    return () => {
      if (mapRef.current) {
        console.log("Cleaning up map base");
        try {
          // First remove all layers to prevent '_removePath' errors
          mapRef.current.eachLayer((layer) => {
            try {
              if (mapRef.current && mapRef.current.hasLayer(layer)) {
                mapRef.current.removeLayer(layer);
              }
            } catch (e) {
              console.error("Error removing layer:", e);
            }
          });
          
          // Then remove the map itself
          mapRef.current.remove();
        } catch (error) {
          console.error("Error removing map:", error);
        }
        mapRef.current = null;
        mapInitializedRef.current = false;
      }
    };
  }, [center, zoom, onMapReady]);

  // Handle container resizing
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current && mapInitializedRef.current) {
        try {
          mapRef.current.invalidateSize(true);
        } catch (e) {
          console.error("Error during resize:", e);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Force a resize after a short delay
    const resizeTimer = setTimeout(handleResize, 500);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <div 
      ref={mapContainerRef} 
      className={cn("h-full w-full min-h-[500px] bg-gray-100", className)} 
      id="leaflet-map-container"
      style={{ position: 'relative', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}
    >
      {initError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background bg-opacity-75 z-50">
          <div className="p-4 bg-background border rounded shadow-lg">
            <p className="text-sm text-destructive">Map initialization error: {initError}</p>
            <button 
              className="mt-2 px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
              onClick={() => {
                setInitError(null);
                initializationAttemptedRef.current = false;
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapBase;
