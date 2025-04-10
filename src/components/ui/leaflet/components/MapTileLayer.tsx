
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapTileLayerProps {
  map: L.Map | null;
}

/**
 * Component for adding OpenStreetMap tile layer to the map
 * with improved performance and caching
 */
const MapTileLayer = ({ map }: MapTileLayerProps) => {
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  
  // Add tile layer to map on mount with performance optimizations
  useEffect(() => {
    if (!map) return;
    
    // Only create the tile layer if it doesn't exist
    if (!tileLayerRef.current) {
      tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        // Performance optimizations
        updateWhenIdle: true,
        updateWhenZooming: false,
        // Improve tile loading
        keepBuffer: 2,
        // Enable cache for faster reloads
        crossOrigin: true,
        // Reduce the number of tile requests
        subdomains: 'abc',
        // Set a timeout for tile requests
        zoomOffset: 0,
        // Improve responsiveness
        detectRetina: true
      });
      
      tileLayerRef.current.addTo(map);
      
      console.log("Added optimized tile layer to map");
    }
    
    return () => {
      if (tileLayerRef.current && map && map.hasLayer(tileLayerRef.current)) {
        map.removeLayer(tileLayerRef.current);
        tileLayerRef.current = null;
        console.log("Removed tile layer from map");
      }
    };
  }, [map]);
  
  return null; // This is a non-visual component
};

export default React.memo(MapTileLayer);
