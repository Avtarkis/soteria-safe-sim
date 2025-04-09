
import React, { useRef, useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';

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
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Only initialize once
    if (mapInstanceRef.current || !mapContainerRef.current) return;
    
    console.log("Initializing map with center:", center, "zoom:", zoom);
    
    try {
      // Give the map container explicit dimensions
      const container = mapContainerRef.current;
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.minHeight = '500px';
      
      // Create the map instance with a slight delay to ensure DOM is ready
      setTimeout(() => {
        try {
          // Create new map instance
          const newMap = L.map(container, {
            center: center,
            zoom: zoom,
            zoomControl: true,
            attributionControl: true
          });
          
          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
          }).addTo(newMap);
          
          // Force map to recognize its container size
          newMap.invalidateSize(true);
          
          // Store reference
          mapInstanceRef.current = newMap;
          
          // Notify parent
          onMapReady(newMap);
          
          // Extra check to make sure map renders
          setTimeout(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize(true);
            }
          }, 1000);
          
        } catch (e) {
          console.error("Error creating map:", e);
          setError(`Map creation failed: ${e}`);
        }
      }, 100);
    } catch (e) {
      console.error("Map initialization error:", e);
      setError(`Map initialization failed: ${e}`);
    }
    
    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        console.log("Cleaning up map instance");
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, onMapReady]);
  
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
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background bg-opacity-75 z-50">
          <div className="p-4 bg-background border rounded shadow-lg">
            <p className="text-sm text-destructive">{error}</p>
            <button 
              className="mt-2 px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
              onClick={() => window.location.reload()}
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
