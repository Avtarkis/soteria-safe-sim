
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
  const initializedTimeRef = useRef<number>(Date.now());
  
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
    console.log("Map is ready");
    setMap(newMap);
    mapInitializedRef.current = true;
    initializedTimeRef.current = Date.now();
  };
  
  // Update view when center or zoom changes - with rate limiting to prevent flashing
  useEffect(() => {
    if (!map || !mapInitializedRef.current) return;
    
    // Add a small delay to ensure map is fully initialized
    // Only set view if the map has been initialized for at least 1 second
    // This prevents constant recentering that can cause flashing
    const timeSinceInit = Date.now() - initializedTimeRef.current;
    if (timeSinceInit < 1000) {
      console.log("Skipping early view update to prevent flashing");
      return;
    }
    
    // Use a debounced update with animation disabled to reduce flickering
    const timer = setTimeout(() => {
      try {
        if (map && map.getContainer() && map.getContainer().clientHeight > 0) {
          map.setView(center, zoom, { animate: false, duration: 0 });
        }
      } catch (error) {
        console.error("Error setting map view:", error);
      }
    }, 250);
    
    return () => clearTimeout(timer);
  }, [map, center, zoom, mapInitializedRef.current]);
  
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
