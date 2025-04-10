
import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef, memo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';
import { ThreatMarker } from '@/types/threats';
import useLocationTracking from './leaflet/useLocationTracking';

// Import components
import MapContainer from './leaflet/MapContainer';
import MapError from './leaflet/MapError';

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
      .user-location-marker .pulse {
        width: 16px;
        height: 16px;
        background-color: #3388ff;
        border-radius: 50%;
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
  const mapContainerRef = useRef<HTMLDivElement>(null);
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
  
  // Initialize map
  useEffect(() => {
    if (mapInitializedRef.current || !mapContainerRef.current) return;
    
    console.log("Initializing map with center:", center, "zoom:", zoom);
    mapInitializedRef.current = true;
    
    // Make sure container is properly sized - critical step
    const validateAndSetContainerSize = () => {
      if (mapContainerRef.current) {
        mapContainerRef.current.style.height = '100%';
        mapContainerRef.current.style.minHeight = '500px';
        mapContainerRef.current.style.width = '100%';
        
        console.log(`Map container dimensions: ${mapContainerRef.current.clientWidth}×${mapContainerRef.current.clientHeight}`);
        
        if (mapContainerRef.current.clientHeight < 10 || mapContainerRef.current.clientWidth < 10) {
          console.warn("Container has insufficient size, forcing dimensions");
          mapContainerRef.current.style.height = '500px'; 
          mapContainerRef.current.style.width = '100%';
        }
      }
    };
    
    validateAndSetContainerSize();
    
    // Delay map creation to ensure DOM has settled
    const initTimer = setTimeout(() => {
      try {
        if (!mapContainerRef.current || !document.body.contains(mapContainerRef.current)) {
          setMapError("Map container not found in DOM");
          return;
        }
        
        validateAndSetContainerSize();
        
        // Create map with conservative settings - no animations until ready
        const newMap = L.map(mapContainerRef.current, {
          zoomControl: true,
          attributionControl: true,
          fadeAnimation: false,
          zoomAnimation: false,
          markerZoomAnimation: false,
          preferCanvas: true,
        });
        
        // Add tile layer - OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(newMap);
        
        // Store map reference
        setMap(newMap);
        
        // Use whenReady to ensure map is fully ready before setting view
        newMap.whenReady(() => {
          try {
            console.log("Map initialized and ready");
            
            // Double check container is still in DOM
            if (!document.body.contains(mapContainerRef.current)) {
              console.error("Map container removed from DOM");
              return;
            }
            
            // Force the map to recognize container size
            newMap.invalidateSize(true);
            
            console.log("Setting initial view to:", center, zoom);
            newMap.setView(center, zoom, { animate: false, duration: 0 });
            
            // Mark map as ready after additional size validation
            setTimeout(() => {
              try {
                if (newMap && document.body.contains(mapContainerRef.current)) {
                  newMap.invalidateSize(true);
                  console.log("Map is fully ready for operations");
                  setIsMapReady(true);
                  
                  // Expose the map instance via ref
                  if (ref && 'current' in ref) {
                    (ref as React.MutableRefObject<L.Map>).current = newMap;
                  }
                }
              } catch (e) {
                console.error("Error in delayed initialization:", e);
              }
            }, 200);
          } catch (error) {
            console.error("Error during map ready callback:", error);
            setMapError(`Map initialization error: ${error}`);
          }
        });
        
      } catch (e) {
        console.error("Map initialization error:", e);
        setMapError(`Map initialization failed: ${e}`);
      }
    }, 300);
    
    return () => {
      clearTimeout(initTimer);
    };
  }, [center, zoom, ref]);
  
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
  
  // Expose the map instance via the ref
  useImperativeHandle(ref, () => {
    return map as L.Map;
  }, [map]);
  
  // Add markers when map and markers are ready
  useEffect(() => {
    if (!map || !isMapReady || !markers.length) return;
    
    console.log(`Adding ${markers.length} markers to map`);
    const markerLayers: L.Marker[] = [];
    
    markers.forEach(marker => {
      try {
        const markerIcon = L.divIcon({
          className: `threat-marker threat-level-${marker.level}`,
          html: `<div class="marker-icon"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        
        const markerInstance = L.marker(marker.position, { icon: markerIcon })
          .addTo(map);
          
        if (onMarkerClick) {
          markerInstance.on('click', () => onMarkerClick(marker));
        }
        
        markerLayers.push(markerInstance);
      } catch (error) {
        console.error("Error adding marker:", error);
      }
    });
    
    return () => {
      markerLayers.forEach(markerInstance => {
        if (map.hasLayer(markerInstance)) {
          map.removeLayer(markerInstance);
        }
      });
    };
  }, [map, isMapReady, markers, onMarkerClick]);
  
  // Add user location marker when tracking is enabled
  useEffect(() => {
    if (!map || !isMapReady || !showUserLocation || !userLocation) return;
    
    try {
      // This is just a visual indicator as the main tracking is done in useLocationTracking
      const locationMarker = L.circle(userLocation, {
        radius: 5,
        color: '#3388ff',
        fillColor: '#3388ff',
        fillOpacity: 1,
        weight: 2
      }).addTo(map);
      
      return () => {
        if (map.hasLayer(locationMarker)) {
          map.removeLayer(locationMarker);
        }
      };
    } catch (error) {
      console.error("Error adding user location indicator:", error);
    }
  }, [map, isMapReady, showUserLocation, userLocation]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("LeafletMap component unmounting");
      if (map) {
        try {
          map.remove();
        } catch (e) {
          console.error("Error removing map:", e);
        }
      }
      mapInitializedRef.current = false;
      setIsMapReady(false);
      setMap(null);
    };
  }, [map]);

  // Handler for retrying after error
  const handleRetry = () => {
    setMapError(null);
    window.location.reload();
  };

  return (
    <div className={cn("relative w-full h-full min-h-[500px]", className)}>
      {/* Use a unique key to prevent React from reusing the same instance */}
      <div key={mapInstanceKey} className="absolute inset-0" style={{ minHeight: '500px' }} ref={mapContainerRef}>
        {/* Map is initialized directly in the useEffect */}
      </div>
      
      {mapError && (
        <MapError error={mapError} onRetry={handleRetry} />
      )}
    </div>
  );
});

LeafletMap.displayName = 'LeafletMap';

// Wrap with memo to prevent re-renders when props haven't changed
export default memo(LeafletMap);
