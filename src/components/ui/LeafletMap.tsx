
import React, { useRef, useEffect, forwardRef, useImperativeHandle, memo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';
import { ThreatMarker } from '@/types/threats';
import useLocationTracking from './leaflet/hooks/useLocationTracking';
import useMapInitialization from './leaflet/hooks/useMapInitialization';
import PulsingStyles from './leaflet/components/PulsingStyles';
import MapTileLayer from './leaflet/components/MapTileLayer';
import MarkersLayer from './leaflet/components/MarkersLayer';
import MapError from './leaflet/MapError';

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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceKey = useRef(`map-instance-${Date.now()}`).current;
  
  // Initialize map
  const {
    map,
    isMapReady,
    mapError,
    debouncedSetView
  } = useMapInitialization({
    containerRef: mapContainerRef,
    center,
    zoom,
    onMapReady: (newMap) => {
      // Expose the map instance via ref
      if (ref && 'current' in ref) {
        (ref as React.MutableRefObject<L.Map>).current = newMap;
      }
    }
  });
  
  // Track user location - Always initialize the hook, but conditionally enable tracking
  const { userLocation, locationAccuracy, safetyLevel } = useLocationTracking({
    map, 
    showUserLocation,
    threatMarkers: markers
  });
  
  // Expose the map instance via the ref
  useImperativeHandle(ref, () => {
    return map as L.Map;
  }, [map]);
  
  // Update view when center or zoom changes
  useEffect(() => {
    if (map && isMapReady) {
      console.log("Center or zoom changed, updating view");
      debouncedSetView(center, zoom);
    }
  }, [map, isMapReady, center, zoom, debouncedSetView]);

  // Handler for retrying after error
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className={cn("relative w-full h-full min-h-[500px]", className)}>
      {/* Add pulsing animation styles */}
      <PulsingStyles />
      
      {/* Map container */}
      <div key={mapInstanceKey} className="absolute inset-0" style={{ minHeight: '500px' }} ref={mapContainerRef}>
        {/* Map is initialized via useMapInitialization hook */}
      </div>
      
      {/* Add tile layer when map is ready */}
      {map && <MapTileLayer map={map} />}
      
      {/* Add markers when map is ready */}
      {map && isMapReady && (
        <MarkersLayer 
          map={map} 
          markers={markers} 
          onMarkerClick={onMarkerClick} 
        />
      )}
      
      {/* Show error if map initialization failed */}
      {mapError && (
        <MapError error={mapError} onRetry={handleRetry} />
      )}
    </div>
  );
});

LeafletMap.displayName = 'LeafletMap';

// Wrap with memo to prevent re-renders when props haven't changed
export default memo(LeafletMap);
