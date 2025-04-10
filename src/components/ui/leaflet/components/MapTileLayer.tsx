
import React from 'react';
import L from 'leaflet';

interface MapTileLayerProps {
  map: L.Map | null;
}

/**
 * Component for adding OpenStreetMap tile layer to the map
 */
const MapTileLayer = ({ map }: MapTileLayerProps) => {
  // Add tile layer to map on mount
  React.useEffect(() => {
    if (!map) return;
    
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);
    
    return () => {
      if (map && map.hasLayer(tileLayer)) {
        map.removeLayer(tileLayer);
      }
    };
  }, [map]);
  
  return null; // This is a non-visual component
};

export default MapTileLayer;
