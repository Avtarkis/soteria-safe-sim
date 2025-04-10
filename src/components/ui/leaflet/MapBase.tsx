
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
  const initializeAttemptedRef = useRef(false);
  
  useEffect(() => {
    // Only initialize once
    if (mapInstanceRef.current || !mapContainerRef.current || initializeAttemptedRef.current) return;
    
    // Mark that we've attempted initialization
    initializeAttemptedRef.current = true;
    
    console.log("Initializing map with center:", center, "zoom:", zoom);
    
    try {
      // Give the map container explicit dimensions and ensure it's visible in the DOM
      const container = mapContainerRef.current;
      if (!container) {
        console.error("Map container ref is null");
        setError("Map container not found");
        return;
      }
      
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.minHeight = '500px';
      container.style.backgroundColor = '#f0f0f0'; // Make container visible
      
      // Create map with more conservative settings
      const newMap = L.map(container, {
        zoomControl: true,
        attributionControl: true,
        fadeAnimation: false,  // Disable animations until ready
        zoomAnimation: false,
        markerZoomAnimation: false,
        preferCanvas: true,    // Better performance
      });
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(newMap);
      
      // Store reference
      mapInstanceRef.current = newMap;
      
      // Wait for map to be fully ready before setting view and notifying parent
      newMap.whenReady(() => {
        try {
          console.log("Map is initialized and ready");
          
          // Force the map to recognize its container size before setting view
          if (newMap && document.body.contains(container)) {
            newMap.invalidateSize(true);
            
            // Set initial view without animation
            newMap.setView(center, zoom, { animate: false, duration: 0 });
            
            // Notify parent that map is ready
            console.log("Map is fully ready for operations");
            onMapReady(newMap);
            
            // Extra safety check to ensure map renders fully
            setTimeout(() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.invalidateSize(true);
              }
            }, 300);
          }
        } catch (error) {
          console.error("Error during map ready callback:", error);
          setError(`Map initialization error: ${error}`);
        }
      });
      
      // Extra safety check to ensure proper rendering
      const safetyTimer = setTimeout(() => {
        if (mapInstanceRef.current && document.body.contains(container)) {
          try {
            mapInstanceRef.current.invalidateSize(true);
            console.log("Map size invalidated after safety timeout");
          } catch (e) {
            console.error("Error in safety timeout:", e);
          }
        }
      }, 1000);
      
      // Cleanup function for when component unmounts
      return () => {
        clearTimeout(safetyTimer);
        
        if (mapInstanceRef.current) {
          console.log("Cleaning up map instance");
          
          try {
            // Remove all event listeners and layers to prevent memory leaks
            mapInstanceRef.current.eachLayer((layer) => {
              if (mapInstanceRef.current && mapInstanceRef.current.hasLayer(layer)) {
                mapInstanceRef.current.removeLayer(layer);
              }
            });
            
            // Remove the map
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
          } catch (e) {
            console.error("Error cleaning up map:", e);
          }
        }
      };
    } catch (e) {
      console.error("Map initialization error:", e);
      setError(`Map initialization failed: ${e}`);
    }
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
