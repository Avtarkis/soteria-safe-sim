
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
  
  // Initialize map when component mounts
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
      
      // Short delay to ensure DOM is ready
      setTimeout(() => {
        try {
          // Create map with optimized settings
          const map = L.map(mapContainerRef.current!, {
            center,
            zoom,
            zoomControl: true,
            preferCanvas: true,
            renderer: L.canvas({ padding: 0.5 }),
            attributionControl: true,
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
          
          // Store ref
          mapRef.current = map;
          
          // Force a redraw of the map container after mounting
          setTimeout(() => {
            if (mapRef.current) {
              // First invalidate size
              mapRef.current.invalidateSize(true);
              
              // Then notify parent
              console.log("Map base initialization complete");
              mapInitializedRef.current = true;
              onMapReady(mapRef.current);
              
              // Trigger another resize after a brief delay
              setTimeout(() => {
                if (mapRef.current) {
                  mapRef.current.invalidateSize(true);
                }
              }, 500);
            }
          }, 300);
        } catch (err) {
          console.error('Error creating Leaflet map:', err);
          setInitError(`Map creation error: ${err}`);
        }
      }, 100);
      
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
        mapRef.current.invalidateSize(true);
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
          </div>
        </div>
      )}
    </div>
  );
};

export default MapBase;
