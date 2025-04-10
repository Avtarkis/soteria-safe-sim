
import React, { useRef, useState, useEffect } from 'react';
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
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const initializeAttemptedRef = useRef(false);
  
  useEffect(() => {
    // Only initialize once
    if (mapInstanceRef.current || !mapContainerRef.current || initializeAttemptedRef.current) return;
    
    // Mark that we've attempted initialization
    initializeAttemptedRef.current = true;
    
    console.log("Initializing map with center:", center, "zoom:", zoom);
    
    // First, make sure container is properly sized - critical step
    if (mapContainerRef.current) {
      mapContainerRef.current.style.height = '100%';
      mapContainerRef.current.style.minHeight = '500px';
      mapContainerRef.current.style.width = '100%';
      mapContainerRef.current.style.backgroundColor = '#f0f0f0'; // Makes container visible
      mapContainerRef.current.style.display = 'block'; // Ensure visibility
    }
    
    // Delay map creation to ensure DOM has settled
    const initTimer = setTimeout(() => {
      try {
        if (!mapContainerRef.current || !document.body.contains(mapContainerRef.current)) {
          console.error("Map container not found in DOM");
          setError("Map container not found");
          return;
        }
        
        // Log container dimensions for debugging
        console.log(`Map container dimensions before init: ${mapContainerRef.current.clientWidth}×${mapContainerRef.current.clientHeight}`);
        
        if (mapContainerRef.current.clientHeight < 10 || mapContainerRef.current.clientWidth < 10) {
          console.warn("Container has insufficient size, forcing dimensions");
          mapContainerRef.current.style.height = '500px'; 
          mapContainerRef.current.style.width = '100%';
        }
        
        // Create map with conservative settings - no animations until ready
        const newMap = L.map(mapContainerRef.current, {
          zoomControl: true,
          attributionControl: true,
          fadeAnimation: false,
          zoomAnimation: false,
          markerZoomAnimation: false,
          preferCanvas: true,
        });
        
        // Add tile layer - OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(newMap);
        
        // Store reference
        mapInstanceRef.current = newMap;
        
        // Critical: Wait for map to be fully ready before setting view/notifying parent
        newMap.whenReady(() => {
          try {
            console.log("Map initialized and ready");
            
            // Double check container is still in DOM
            if (!document.body.contains(mapContainerRef.current)) {
              console.error("Map container removed from DOM");
              return;
            }
            
            // Force the map to recognize container size
            newMap.invalidateSize(true);
            
            // Set initial view without animation
            console.log("Setting initial view to:", center, zoom);
            newMap.setView(center, zoom, { animate: false, duration: 0 });
            
            // Additional size validation after brief delay
            setTimeout(() => {
              try {
                if (newMap && document.body.contains(mapContainerRef.current)) {
                  newMap.invalidateSize(true);
                  console.log("Map size invalidated after delay");
                  
                  // Notify parent that map is ready only when we're confident
                  console.log("Map is fully ready, notifying parent");
                  onMapReady(newMap);
                }
              } catch (e) {
                console.error("Error in delayed initialization:", e);
              }
            }, 200);
          } catch (error) {
            console.error("Error during map ready callback:", error);
            setError(`Map initialization error: ${error}`);
          }
        });
        
        // Add additional safety timeout for map rendering
        const safetyTimer = setTimeout(() => {
          if (mapInstanceRef.current && document.body.contains(mapContainerRef.current)) {
            try {
              mapInstanceRef.current.invalidateSize(true);
              console.log("Map size invalidated after final safety timeout");
            } catch (e) {
              console.error("Error in safety timeout:", e);
            }
          }
        }, 1500); // Longer timeout for more reliability
        
        // Cleanup function for unmounting
        return () => {
          clearTimeout(safetyTimer);
          
          if (mapInstanceRef.current) {
            console.log("Cleaning up map instance");
            
            try {
              // Remove all layers and handlers to prevent memory leaks
              mapInstanceRef.current.eachLayer((layer) => {
                if (mapInstanceRef.current && mapInstanceRef.current.hasLayer(layer)) {
                  mapInstanceRef.current.removeLayer(layer);
                }
              });
              
              // Remove the map
              mapInstanceRef.current.remove();
              mapInstanceRef.current = null;
            } catch (e) {
              console.error("Error cleaning up map:", e);
            }
          }
        };
      } catch (e) {
        console.error("Map initialization error:", e);
        setError(`Map initialization failed: ${e}`);
      }
    }, 300); // Delay initialization to ensure DOM is ready
    
    return () => {
      clearTimeout(initTimer);
    };
  }, [center, zoom, onMapReady]);
  
  return (
    <div 
      ref={mapContainerRef} 
      className={cn("h-full w-full min-h-[500px] bg-gray-100", className)} 
      id="leaflet-map-container"
      style={{ 
        position: 'relative', 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        overflow: 'hidden',
        height: '500px', // Explicit height is critical
        visibility: 'visible', // Force visibility
        display: 'block' // Ensure it's rendered as a block
      }}
    >
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background bg-opacity-75 z-50">
          <div className="p-4 bg-background border rounded shadow-lg">
            <p className="text-sm text-destructive">{error}</p>
            <button 
              className="mt-2 px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
              onClick={() => window.location.reload()}
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
