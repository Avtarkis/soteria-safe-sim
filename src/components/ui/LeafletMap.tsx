
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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  
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
    }, 500);
    
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
  
  // Handle map initialization with improved error handling
  const handleMapReady = (newMap: L.Map) => {
    console.log("Map base is now ready");
    
    if (newMap && newMap.getContainer()) {
      // Ensure map container is visible and has size
      newMap.invalidateSize(true);
      
      // Set map state
      setMap(newMap);
      
      // Delay setting view to ensure container is fully rendered
      setTimeout(() => {
        try {
          if (newMap && document.body.contains(newMap.getContainer())) {
            newMap.setView(center, zoom, { animate: false, duration: 0 });
            console.log("Map is fully ready for operations");
            setIsMapReady(true);
          }
        } catch (error) {
          console.error("Initial setView failed:", error);
          setMapError("Failed to set map view. Please refresh the page.");
        }
      }, 500);
    } else {
      console.error("Map container not ready");
      setMapError("Map container not ready. Please refresh the page.");
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("LeafletMap component unmounting");
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
      {mapContainerRef.current && (
        <MapBase 
          center={center} 
          zoom={zoom} 
          onMapReady={handleMapReady}
        />
      )}
      
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
