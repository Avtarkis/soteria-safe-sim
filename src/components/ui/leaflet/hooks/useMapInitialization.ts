
import { useState, useEffect, useCallback, useRef } from 'react';
import L from 'leaflet';
import { debounce } from '@/lib/utils';

interface MapInitOptions {
  containerRef: React.RefObject<HTMLDivElement>;
  center: [number, number];
  zoom: number;
  onMapReady: (map: L.Map) => void;
}

/**
 * Hook for initializing a Leaflet map with error handling and optimizations
 */
const useMapInitialization = ({ 
  containerRef, 
  center, 
  zoom, 
  onMapReady 
}: MapInitOptions) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const initAttemptedRef = useRef(false);
  
  // Create debounced setView function to prevent too many view updates
  const debouncedSetView = useCallback(
    debounce((newCenter: [number, number], newZoom: number) => {
      if (map && isMapReady) {
        try {
          map.setView(newCenter, newZoom, { animate: true });
        } catch (error) {
          console.error("Error setting map view:", error);
        }
      }
    }, 300),
    [map, isMapReady]
  );
  
  // Initialize map
  useEffect(() => {
    // Only initialize once
    if (map || !containerRef.current || initAttemptedRef.current) return;
    
    // Mark that we've attempted initialization
    initAttemptedRef.current = true;
    
    // Ensure container is visible
    if (containerRef.current) {
      const container = containerRef.current;
      
      // Ensure the container has dimensions
      if (container.clientHeight < 10) {
        container.style.height = '500px';
      }
      if (container.clientWidth < 10) {
        container.style.width = '100%';
      }
    }
    
    // Create map instance
    try {
      const newMap = L.map(containerRef.current, {
        center,
        zoom,
        zoomControl: true,
        attributionControl: true,
        preferCanvas: true // Better performance for many markers
      });
      
      setMap(newMap);
      
      // Handle when map is ready
      newMap.whenReady(() => {
        console.log("Map is ready");
        setIsMapReady(true);
        onMapReady(newMap);
        
        // Force a resize on first load
        setTimeout(() => {
          if (newMap) {
            newMap.invalidateSize(true);
          }
        }, 100);
      });
      
      // Add error event listener
      newMap.on('error', (e: any) => {
        console.error("Map error:", e.error || e);
        setMapError(e.error?.message || "Unknown map error");
      });
    } catch (error) {
      console.error("Error creating map:", error);
      setMapError(`Failed to initialize map: ${error}`);
    }
    
    // Cleanup function
    return () => {
      if (map) {
        map.remove();
        setMap(null);
        setIsMapReady(false);
      }
    };
  }, [containerRef, center, zoom, onMapReady, map]);
  
  return {
    map,
    isMapReady,
    mapError,
    debouncedSetView
  };
};

export default useMapInitialization;
