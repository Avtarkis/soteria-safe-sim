
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
import MapContainer from './leaflet/MapContainer';
import MapError from './leaflet/MapError';
import MapEvents from './leaflet/MapEvents';

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

// Debounce function to limit frequent view updates
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

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
  const [isMapReady, setIsMapReady] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapInitializedRef = useRef<boolean>(false);
  
  // Track user location
  const { userLocation, locationAccuracy, safetyLevel } = useLocationTracking(
    isMapReady ? map : null, 
    showUserLocation,
    markers
  );
  
  // Add pulsing animation styles
  useEffect(() => {
    addPulsingStyles();
    
    // Trigger global resize event to help Leaflet recognize container size
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
    
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
  
  // Create debounced setView function to prevent rapid updates
  const debouncedSetView = useRef(
    debounce((targetMap: L.Map, viewCenter: [number, number], viewZoom: number) => {
      if (!targetMap || !targetMap.getContainer() || !document.body.contains(targetMap.getContainer())) {
        return;
      }
      
      targetMap.whenReady(() => {
        try {
          targetMap.setView(viewCenter, viewZoom, { animate: false });
          console.log("✅ Debounced setView executed successfully");
        } catch (error) {
          console.error("❌ Debounced setView failed:", error);
        }
      });
    }, 300)
  ).current;
  
  // Update view when center or zoom changes
  useEffect(() => {
    if (map && isMapReady) {
      debouncedSetView(map, center, zoom);
    }
  }, [map, isMapReady, center, zoom, debouncedSetView]);
  
  // Handle map initialization with improved error handling
  const handleMapReady = (newMap: L.Map) => {
    console.log("Map base is now ready");
    
    if (newMap && newMap.getContainer() && document.body.contains(newMap.getContainer())) {
      // Set map state
      setMap(newMap);
      
      // Use whenReady to ensure map is fully initialized before setting view
      newMap.whenReady(() => {
        try {
          if (document.body.contains(newMap.getContainer())) {
            // Force a resize of the map to ensure proper dimensions
            newMap.invalidateSize(true);
            
            // Set initial view without animation
            newMap.setView(center, zoom, { animate: false, duration: 0 });
            console.log("✅ Map is fully ready for operations");
            
            // Mark map as ready for other operations
            mapInitializedRef.current = true;
            setIsMapReady(true);
          }
        } catch (error) {
          console.error("❌ Initial setView failed:", error);
          setMapError("Failed to set map view. Please refresh the page.");
        }
      });
    } else {
      console.error("Map container not ready");
      setMapError("Map container not ready. Please refresh the page.");
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("LeafletMap component unmounting");
      mapInitializedRef.current = false;
      setIsMapReady(false);
      setMap(null);
    };
  }, []);

  // Handler for retrying after error
  const handleRetry = () => {
    setMapError(null);
    window.location.reload();
  };

  return (
    <div className={cn("relative w-full h-full min-h-[500px]", className)}>
      <MapBase 
        center={center} 
        zoom={zoom} 
        onMapReady={handleMapReady}
      />
      
      {map && isMapReady && (
        <>
          <MarkerLayer 
            map={map}
            markers={markers}
            onMarkerClick={onMarkerClick}
          />
          
          {showUserLocation && (
            <UserLocationLayer 
              map={map}
              userLocation={userLocation}
              accuracy={locationAccuracy}
              safetyLevel={safetyLevel}
            />
          )}
          
          <MapEvents map={map} />
        </>
      )}
      
      {mapError && (
        <MapError error={mapError} onRetry={handleRetry} />
      )}
    </div>
  );
});

LeafletMap.displayName = 'LeafletMap';

// Wrap with memo to prevent re-renders when props haven't changed
export default memo(LeafletMap);
