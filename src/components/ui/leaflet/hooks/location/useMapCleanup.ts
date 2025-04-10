
import { useCallback } from 'react';
import L from 'leaflet';

/**
 * Hook to handle map layer cleanup
 */
export function useMapCleanup(map: L.Map | null) {
  // Function to safely remove a map layer
  const safelyRemoveLayer = useCallback((layer: L.Layer | null) => {
    if (layer && map) {
      try {
        // Check if the layer is still on the map
        if (map.hasLayer(layer)) {
          map.removeLayer(layer);
        }
      } catch (error) {
        console.error("Error removing layer:", error);
      }
    }
    return null;
  }, [map]);
  
  return { safelyRemoveLayer };
}
