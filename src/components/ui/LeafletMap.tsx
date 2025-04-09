
import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef, memo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';
import { ThreatMarker } from '@/types/threats';

// Import refactored components
import MapBase from './leaflet/MapBase';
import MarkerLayer from './leaflet/MarkerLayer';
import UserLocationLayer from './leaflet/UserLocationLayer';
import useLocationTracking from './leaflet/useLocationTracking';

// CSS for pulsing animation
const addPulsingStyles = () => {
  if (!document.getElementById('pulsing-marker-style')) {
    const style = document.createElement('style');
    style.id = 'pulsing-marker-style';
    style.innerHTML = `
      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 0.8;
        }
        70% {
          transform: scale(2);
          opacity: 0.3;
        }
        100% {
          transform: scale(1);
          opacity: 0.8;
        }
      }
      .user-marker-pulse {
        animation: pulse 2s infinite;
      }
    `;
    document.head.appendChild(style);
  }
};

interface LeafletMapProps {
  className?: string;
  markers?: ThreatMarker[];
  onMarkerClick?: (marker: ThreatMarker) => void;
  center?: [number, number];
  zoom?: number;
  showUserLocation?: boolean;
}

// Use React.memo to prevent unnecessary re-renders
const LeafletMap = forwardRef<L.Map, LeafletMapProps>(({
  className,
  markers = [],
  onMarkerClick,
  center = [40.7128, -74.006],
  zoom = 13,
  showUserLocation = false
}, ref) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const mapInitializedRef = useRef<boolean>(false);
  const prevCenterRef = useRef<[number, number]>(center);
  const prevZoomRef = useRef<number>(zoom);
  const viewUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const updateBlockedUntilRef = useRef<number>(0);
  const mapElementsInitializedRef = useRef<boolean>(false);
  const mapReadyForOperationsRef = useRef<boolean>(false);
  
  // Track user location
  const { userLocation, locationAccuracy, safetyLevel } = useLocationTracking(
    map, 
    showUserLocation,
    markers
  );
  
  // Add pulsing animation styles
  useEffect(() => {
    addPulsingStyles();
    
    return () => {
      const styleElem = document.getElementById('pulsing-marker-style');
      if (styleElem) {
        styleElem.remove();
      }
    };
  }, []);
  
  // Expose the map instance via the ref
  useImperativeHandle(ref, () => {
    return map as L.Map;
  }, [map]);
  
  // Handle map initialization
  const handleMapReady = (newMap: L.Map) => {
    console.log("Map base is now ready");
    setMap(newMap);
    mapInitializedRef.current = true;
    
    // Allow a short delay for the map to fully render before enabling operations
    setTimeout(() => {
      if (newMap && newMap.getContainer() && newMap.getContainer().clientHeight > 0) {
        console.log("Map is fully ready for operations");
        mapReadyForOperationsRef.current = true;
        
        // Initial center and zoom (only once at startup)
        try {
          newMap.setView(center, zoom, { animate: false, duration: 0 });
          prevCenterRef.current = center;
          prevZoomRef.current = zoom;
        } catch (error) {
          console.error("Initial setView failed:", error);
        }
        
        // Explicitly trigger a resize
        setTimeout(() => {
          if (newMap) {
            newMap.invalidateSize(true);
          }
        }, 300);
      }
    }, 300);
  };
  
  // Handle changes to center/zoom with aggressive debouncing and change detection
  useEffect(() => {
    if (!map || !mapInitializedRef.current || !mapReadyForOperationsRef.current) return;
    
    // Skip if we're still in the update cooling period
    if (Date.now() < updateBlockedUntilRef.current) {
      return;
    }
    
    // Clear any pending view update
    if (viewUpdateTimeoutRef.current) {
      clearTimeout(viewUpdateTimeoutRef.current);
    }
    
    // Only update if there's a significant change (more than 0.01 degrees or zoom change)
    const centerChanged = 
      Math.abs(center[0] - prevCenterRef.current[0]) > 0.01 || 
      Math.abs(center[1] - prevCenterRef.current[1]) > 0.01;
    const zoomChanged = zoom !== prevZoomRef.current;
    
    if (centerChanged || zoomChanged) {
      // Delay updates to prevent rapid changes
      viewUpdateTimeoutRef.current = setTimeout(() => {
        // Only proceed if the map is still valid and ready
        if (map && map.getContainer() && map.getContainer().clientHeight > 0 && mapReadyForOperationsRef.current) {
          try {
            // Use flyTo for smoother transitions and less flickering
            map.flyTo(center, zoom, { 
              animate: true, 
              duration: 0.5, // Short duration to minimize flashing
              easeLinearity: 0.5 
            });
            
            // Update previous values
            prevCenterRef.current = center;
            prevZoomRef.current = zoom;
            
            // Block further updates for 1 second
            updateBlockedUntilRef.current = Date.now() + 1000;
          } catch (error) {
            console.error("Error setting map view:", error);
          }
        }
        viewUpdateTimeoutRef.current = null;
      }, 600); // Longer debounce (600ms)
    }
    
    return () => {
      if (viewUpdateTimeoutRef.current) {
        clearTimeout(viewUpdateTimeoutRef.current);
      }
    };
  }, [map, center, zoom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("LeafletMap component unmounting");
      if (viewUpdateTimeoutRef.current) {
        clearTimeout(viewUpdateTimeoutRef.current);
      }
      updateBlockedUntilRef.current = 0;
      mapInitializedRef.current = false;
      mapReadyForOperationsRef.current = false;
      mapElementsInitializedRef.current = false;
    };
  }, []);
  
  return (
    <div className={cn("h-full w-full min-h-[400px] relative", className)}>
      <MapBase 
        center={center} 
        zoom={zoom} 
        onMapReady={handleMapReady}
      />
      
      {map && mapInitializedRef.current && mapReadyForOperationsRef.current && (
        <>
          {markers && markers.length > 0 && (
            <MarkerLayer 
              map={map}
              markers={markers}
              onMarkerClick={onMarkerClick}
            />
          )}
          
          {showUserLocation && (
            <UserLocationLayer 
              map={map}
              userLocation={userLocation}
              accuracy={locationAccuracy}
              safetyLevel={safetyLevel}
            />
          )}
        </>
      )}
    </div>
  );
});

LeafletMap.displayName = 'LeafletMap';

// Wrap with memo to prevent re-renders when props haven't changed
export default memo(LeafletMap);
