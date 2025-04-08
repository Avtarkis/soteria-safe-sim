
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
  };
  
  // Update view when center or zoom changes, but only after map is properly initialized
  useEffect(() => {
    if (!map || !mapInitializedRef.current) return;
    
    // Add a small delay to ensure map is fully initialized
    const timer = setTimeout(() => {
      try {
        // Check if map container is valid
        if (map && map.getContainer() && map._loaded) {
          map.setView(center, zoom, { animate: false });
        }
      } catch (error) {
        console.error("Error setting map view:", error);
      }
    }, 100);
    
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
