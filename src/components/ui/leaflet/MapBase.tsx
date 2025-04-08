
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';

// Fix marker icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
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
  
  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainerRef.current || mapInitializedRef.current) return;
    
    try {
      console.log('Initializing map base with center:', center, 'zoom:', zoom);
      
      // Create map with optimized settings
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: false,
        preferCanvas: true,
        renderer: L.canvas({ padding: 0.5 }),
        attributionControl: false,
      });

      // Add basic controls
      L.control.attribution({
        prefix: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        position: 'bottomright'
      }).addTo(map);
      
      L.control.zoom({
        position: 'bottomright'
      }).addTo(map);

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
        updateWhenIdle: true,
        updateWhenZooming: false
      }).addTo(map);
      
      // Store refs
      mapRef.current = map;
      mapInitializedRef.current = true;
      
      // Use a safe timeout to ensure proper initialization
      setTimeout(() => {
        if (mapRef.current) {
          try {
            // Check if the container is properly loaded - use container size check instead of _loaded
            if (map.getContainer() && map.getContainer().clientHeight > 0) {
              window.dispatchEvent(new Event('resize'));
              map.invalidateSize(true);
              
              // Notify parent component that map is ready
              onMapReady(map);
            } else {
              console.log("Map container not ready, retrying...");
              // Try again a bit later if needed
              setTimeout(() => {
                if (mapRef.current && mapRef.current.getContainer()) {
                  mapRef.current.invalidateSize(true);
                  onMapReady(mapRef.current);
                }
              }, 500);
            }
          } catch (error) {
            console.error("Error during map initialization:", error);
          }
        }
      }, 200);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
    
    // Cleanup when component unmounts
    return () => {
      if (mapRef.current) {
        console.log("Cleaning up map");
        try {
          mapRef.current.remove();
        } catch (error) {
          console.error("Error removing map:", error);
        }
        mapRef.current = null;
        mapInitializedRef.current = false;
      }
    };
  }, [center, zoom, onMapReady]);

  return (
    <div 
      ref={mapContainerRef} 
      className={cn("h-full w-full min-h-[300px]", className)} 
      id="leaflet-map-container"
    />
  );
};

export default MapBase;
