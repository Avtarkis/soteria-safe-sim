
import React, { useEffect } from 'react';
import L from 'leaflet';

interface MapResizeHandlerProps {
  map: L.Map | null;
  mapInitialized: boolean;
}

/**
 * Component to handle map resize events
 */
const MapResizeHandler = ({ map, mapInitialized }: MapResizeHandlerProps) => {
  // Handle container resizing
  useEffect(() => {
    const handleResize = () => {
      if (map && mapInitialized) {
        try {
          map.invalidateSize(true);
        } catch (e) {
          console.error("Error during resize:", e);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Force a resize after a short delay
    const resizeTimer = setTimeout(handleResize, 500);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [map, mapInitialized]);

  return null; // This is a non-visual component
};

export default MapResizeHandler;
