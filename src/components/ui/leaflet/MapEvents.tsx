
import { useEffect } from 'react';
import L from 'leaflet';

interface MapEventsProps {
  map: L.Map | null;
  onMapReady?: () => void;
}

/**
 * Component to handle map events like resize and visibility changes
 */
const MapEvents = ({ map, onMapReady }: MapEventsProps) => {
  // Handle container resizing
  useEffect(() => {
    if (!map) return;

    const handleResize = () => {
      if (map) {
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

    // Trigger onMapReady if provided
    if (onMapReady) {
      onMapReady();
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [map, onMapReady]);

  return null;
};

export default MapEvents;
