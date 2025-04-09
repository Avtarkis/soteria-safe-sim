
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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const initAttemptsRef = useRef<number>(0);
  
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
  
  // Handle map initialization with retry logic
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
          
          // Try again after a delay
          setTimeout(() => {
            try {
              if (newMap) {
                newMap.invalidateSize(true);
                newMap.setView(center, zoom, { animate: false });
              }
            } catch (e) {
              console.error("Retry setView failed:", e);
            }
          }, 500);
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

  // Create a style to ensure the map container is visible
  const mapContainerStyle = {
    height: '100%',
    width: '100%',
    minHeight: '500px',
    position: 'relative' as 'relative',
    backgroundColor: '#f0f0f0'
  };
  
  return (
    <div 
      className={cn("h-full w-full min-h-[500px] relative", className)}
      ref={mapContainerRef}
      style={mapContainerStyle}
    >
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
