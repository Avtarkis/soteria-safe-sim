
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
  const [isMapReady, setIsMapReady] = useState<boolean>(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
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
  
  // Ensure container exists before attempting to create map
  useEffect(() => {
    // Quick check to ensure container is in DOM before initializing
    const containerCheck = setInterval(() => {
      if (mapContainerRef.current && 
          document.body.contains(mapContainerRef.current) &&
          mapContainerRef.current.clientHeight > 0) {
        clearInterval(containerCheck);
        mapInitializedRef.current = true;
      }
    }, 100);
    
    return () => clearInterval(containerCheck);
  }, []);
  
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
          
          // Final retry
          setTimeout(() => {
            try {
              if (newMap && document.body.contains(newMap.getContainer())) {
                newMap.invalidateSize(true);
                newMap.setView(center, zoom, { animate: false });
                setIsMapReady(true);
              }
            } catch (e) {
              console.error("Retry setView failed:", e);
              setMapError("Failed to set map view. Please refresh the page.");
            }
          }, 1000);
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
      {mapContainerRef.current && document.body.contains(mapContainerRef.current) && (
        <MapBase 
          center={center} 
          zoom={zoom} 
          onMapReady={handleMapReady}
        />
      )}
      
      {map && isMapReady && (
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
      
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
          <div className="p-4 bg-background border rounded shadow-lg">
            <h3 className="text-lg font-medium">Map Error</h3>
            <p className="text-sm text-destructive my-2">{mapError}</p>
            <button 
              className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

LeafletMap.displayName = 'LeafletMap';

// Wrap with memo to prevent re-renders when props haven't changed
export default memo(LeafletMap);
