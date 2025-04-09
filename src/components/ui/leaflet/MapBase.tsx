
import React, { useRef, useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';
import MapInitializer from './map-base/MapInitializer';
import MapResizeHandler from './map-base/MapResizeHandler';
import MapCleanup from './map-base/MapCleanup';

// Fix marker icon issues - explicitly set the icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapBaseProps {
  className?: string;
  center: [number, number];
  zoom: number;
  onMapReady: (map: L.Map) => void;
}

const MapBase = ({
  className,
  center,
  zoom,
  onMapReady
}: MapBaseProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const mapInitializedRef = useRef(false);
  const initializationAttemptedRef = useRef(false);
  const [initError, setInitError] = useState<string | null>(null);
  
  // Force initialization of map after component is mounted
  useEffect(() => {
    if (!mapInitializedRef.current && !initializationAttemptedRef.current && mapContainerRef.current) {
      console.log("Attempting manual map initialization");
      try {
        // Create a new map instance directly
        if (!mapRef.current && mapContainerRef.current) {
          // Create the map
          const newMap = L.map(mapContainerRef.current, {
            center: center,
            zoom: zoom,
            layers: [
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              })
            ]
          });
          
          // Store the map reference
          mapRef.current = newMap;
          mapInitializedRef.current = true;
          
          // Notify parent component
          onMapReady(newMap);
          console.log("Map manually initialized successfully");
        }
      } catch (error) {
        console.error("Manual map initialization failed:", error);
        setInitError("Failed to initialize map. Please try again.");
      } finally {
        initializationAttemptedRef.current = true;
      }
    }
  }, [center, zoom, onMapReady]);
  
  const handleMapReady = (map: L.Map) => {
    mapRef.current = map;
    onMapReady(map);
  };

  return (
    <div 
      ref={mapContainerRef} 
      className={cn("h-full w-full min-h-[500px] bg-gray-100", className)} 
      id="leaflet-map-container"
      style={{ 
        position: 'relative', 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        overflow: 'hidden',
        height: '500px' // Explicit height
      }}
    >
      <MapInitializer 
        mapContainerRef={mapContainerRef}
        center={center}
        zoom={zoom}
        onMapReady={handleMapReady}
        onInitError={setInitError}
        mapInitializedRef={mapInitializedRef}
        initializationAttemptedRef={initializationAttemptedRef}
      />
      
      <MapResizeHandler 
        map={mapRef.current} 
        mapInitialized={mapInitializedRef.current} 
      />
      
      <MapCleanup 
        map={mapRef.current}
        mapInitializedRef={mapInitializedRef}
      />
      
      {initError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background bg-opacity-75 z-50">
          <div className="p-4 bg-background border rounded shadow-lg">
            <p className="text-sm text-destructive">Map initialization error: {initError}</p>
            <button 
              className="mt-2 px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
              onClick={() => {
                setInitError(null);
                initializationAttemptedRef.current = false;
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapBase;
