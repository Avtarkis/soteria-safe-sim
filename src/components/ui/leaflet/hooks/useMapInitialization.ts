
import { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';

interface UseMapInitializationProps {
  containerRef: React.RefObject<HTMLDivElement>;
  center: [number, number];
  zoom: number;
  onMapReady?: (map: L.Map) => void;
}

/**
 * Hook to handle map initialization
 */
export function useMapInitialization({
  containerRef,
  center,
  zoom,
  onMapReady
}: UseMapInitializationProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapInitializedRef = useRef<boolean>(false);
  
  // Initialize map
  useEffect(() => {
    if (mapInitializedRef.current || !containerRef.current) return;
    
    console.log("Initializing map with center:", center, "zoom:", zoom);
    mapInitializedRef.current = true;
    
    // Make sure container is properly sized - critical step
    const validateAndSetContainerSize = () => {
      if (containerRef.current) {
        containerRef.current.style.height = '100%';
        containerRef.current.style.minHeight = '500px';
        containerRef.current.style.width = '100%';
        
        console.log(`Map container dimensions: ${containerRef.current.clientWidth}×${containerRef.current.clientHeight}`);
        
        if (containerRef.current.clientHeight < 10 || containerRef.current.clientWidth < 10) {
          console.warn("Container has insufficient size, forcing dimensions");
          containerRef.current.style.height = '500px'; 
          containerRef.current.style.width = '100%';
        }
      }
    };
    
    validateAndSetContainerSize();
    
    // Delay map creation to ensure DOM has settled
    const initTimer = setTimeout(() => {
      try {
        if (!containerRef.current || !document.body.contains(containerRef.current)) {
          setMapError("Map container not found in DOM");
          return;
        }
        
        validateAndSetContainerSize();
        
        // Create map with conservative settings - no animations until ready
        const newMap = L.map(containerRef.current, {
          zoomControl: true,
          attributionControl: true,
          fadeAnimation: false,
          zoomAnimation: false,
          markerZoomAnimation: false,
          preferCanvas: true,
        });
        
        // Store map reference
        setMap(newMap);
        
        // Use whenReady to ensure map is fully ready before setting view
        newMap.whenReady(() => {
          try {
            console.log("Map initialized and ready");
            
            // Double check container is still in DOM
            if (!document.body.contains(containerRef.current)) {
              console.error("Map container removed from DOM");
              return;
            }
            
            // Force the map to recognize container size
            newMap.invalidateSize(true);
            
            console.log("Setting initial view to:", center, zoom);
            newMap.setView(center, zoom, { animate: false, duration: 0 });
            
            // Mark map as ready after additional size validation
            setTimeout(() => {
              try {
                if (newMap && document.body.contains(containerRef.current)) {
                  newMap.invalidateSize(true);
                  console.log("Map is fully ready for operations");
                  setIsMapReady(true);
                  
                  // Call onMapReady callback if provided
                  if (onMapReady) {
                    onMapReady(newMap);
                  }
                }
              } catch (e) {
                console.error("Error in delayed initialization:", e);
              }
            }, 200);
          } catch (error) {
            console.error("Error during map ready callback:", error);
            setMapError(`Map initialization error: ${error}`);
          }
        });
        
      } catch (e) {
        console.error("Map initialization error:", e);
        setMapError(`Map initialization failed: ${e}`);
      }
    }, 300);
    
    return () => {
      clearTimeout(initTimer);
    };
  }, [center, zoom, onMapReady, containerRef]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("Map initialization hook unmounting");
      if (map) {
        try {
          map.remove();
        } catch (e) {
          console.error("Error removing map:", e);
        }
      }
      mapInitializedRef.current = false;
      setIsMapReady(false);
      setMap(null);
    };
  }, [map]);
  
  // Create a debounced setView function
  const debouncedSetView = useCallback((newCenter: [number, number], newZoom: number) => {
    if (!map || !map.getContainer() || !document.body.contains(map.getContainer())) {
      console.warn("Cannot set view - map container not available");
      return;
    }
    
    map.whenReady(() => {
      try {
        console.log("Setting view with debounced function:", newCenter, newZoom);
        map.setView(newCenter, newZoom, { animate: false });
        
        // Force map to update its size after view change
        setTimeout(() => {
          if (map && document.body.contains(map.getContainer())) {
            map.invalidateSize(true);
          }
        }, 100);
      } catch (error) {
        console.error("Debounced setView failed:", error);
      }
    });
  }, [map]);
  
  return {
    map,
    isMapReady,
    mapError,
    debouncedSetView
  };
}

export default useMapInitialization;
