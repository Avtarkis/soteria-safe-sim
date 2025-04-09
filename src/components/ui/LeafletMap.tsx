
import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef } from 'react';
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
    setMap(newMap);
    mapInitializedRef.current = true;
  };
  
  // Update view only when center or zoom changes significantly
  useEffect(() => {
    if (!map || !mapInitializedRef.current) return;
    
    // Debounce view updates to prevent flickering
    if (viewUpdateTimeoutRef.current) {
      clearTimeout(viewUpdateTimeoutRef.current);
    }
    
    // Check if view actually needs to be updated (significant change)
    const centerChanged = 
      Math.abs(center[0] - prevCenterRef.current[0]) > 0.001 || 
      Math.abs(center[1] - prevCenterRef.current[1]) > 0.001;
    const zoomChanged = zoom !== prevZoomRef.current;
    
    if (centerChanged || zoomChanged) {
      // Only update view for significant changes
      viewUpdateTimeoutRef.current = setTimeout(() => {
        try {
          // Only update if map container exists and has a proper size
          if (map && map.getContainer() && map.getContainer().clientHeight > 0) {
            map.setView(center, zoom, { animate: false, duration: 0 });
            
            // Update previous values
            prevCenterRef.current = center;
            prevZoomRef.current = zoom;
          }
        } catch (error) {
          console.error("Error setting map view:", error);
        }
        viewUpdateTimeoutRef.current = null;
      }, 300); // Longer debounce to prevent rapid updates
    }
    
    return () => {
      if (viewUpdateTimeoutRef.current) {
        clearTimeout(viewUpdateTimeoutRef.current);
      }
    };
  }, [map, center, zoom]);
  
  return (
    <div className={cn("h-full w-full min-h-[300px] relative", className)}>
      <MapBase 
        center={center} 
        zoom={zoom} 
        onMapReady={handleMapReady}
      />
      
      {map && mapInitializedRef.current && (
        <>
          <MarkerLayer 
            map={map}
            markers={markers}
            onMarkerClick={onMarkerClick}
          />
          
          {showUserLocation && userLocation && (
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

export default LeafletMap;
