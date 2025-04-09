
import { useEffect } from 'react';
import L from 'leaflet';

interface MapCleanupProps {
  map: L.Map | null;
  mapInitializedRef: React.MutableRefObject<boolean>;
}

/**
 * Component to handle cleanup when map unmounts
 */
const MapCleanup = ({ map, mapInitializedRef }: MapCleanupProps) => {
  useEffect(() => {
    return () => {
      if (map) {
        console.log("Cleaning up map base");
        try {
          // First remove all layers to prevent '_removePath' errors
          map.eachLayer((layer) => {
            try {
              if (map && map.hasLayer(layer)) {
                map.removeLayer(layer);
              }
            } catch (e) {
              console.error("Error removing layer:", e);
            }
          });
          
          // Then remove the map itself
          map.remove();
        } catch (error) {
          console.error("Error removing map:", error);
        }
        mapInitializedRef.current = false;
      }
    };
  }, [map, mapInitializedRef]);

  return null; // This is a non-visual component
};

export default MapCleanup;
