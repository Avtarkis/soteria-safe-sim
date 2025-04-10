
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
  const mapInstanceKey = useRef(`map-instance-${Date.now()}`).current;
  
  // Track user location - Only run after map is ready
  const { userLocation, locationAccuracy, safetyLevel } = useLocationTracking(
    isMapReady ? map : null, 
    showUserLocation,
    markers
  );
  
  // Add pulsing animation styles
  useEffect(() => {
    addPulsingStyles();
    
    // Trigger global resize event to help Leaflet recognize container size
    const resizeTimer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 500);
    
    return () => {
      clearTimeout(resizeTimer);
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
        console.warn("Cannot set view - map container not available");
        return;
      }
      
      targetMap.whenReady(() => {
        try {
          console.log("Setting view with debounced function:", viewCenter, viewZoom);
          targetMap.setView(viewCenter, viewZoom, { animate: false });
          
          // Force map to update its size after view change
          setTimeout(() => {
            if (targetMap && document.body.contains(targetMap.getContainer())) {
              targetMap.invalidateSize(true);
            }
          }, 100);
          
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
      console.log("Center or zoom changed, updating view");
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
            console.log("Setting initial view from handleMapReady", center, zoom);
            newMap.setView(center, zoom, { animate: false, duration: 0 });
            
            // Add a small delay before marking as ready
            setTimeout(() => {
              console.log("✅ Map is fully ready for operations");
              
              // Mark map as ready for other operations
              mapInitializedRef.current = true;
              setIsMapReady(true);
              
              // Final forced resize
              if (newMap && document.body.contains(newMap.getContainer())) {
                newMap.invalidateSize(true);
              }
            }, 200);
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
      {/* Use a unique key to prevent React from reusing the same instance */}
      <div key={mapInstanceKey} className="absolute inset-0" style={{ minHeight: '500px' }}>
        <MapBase 
          center={center} 
          zoom={zoom} 
          onMapReady={handleMapReady}
        />
      </div>
      
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
