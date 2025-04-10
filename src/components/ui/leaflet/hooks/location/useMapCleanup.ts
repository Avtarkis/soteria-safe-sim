
import { useCallback } from 'react';
import L from 'leaflet';
import { LocationRefType } from './useLocationRefs';
import { cleanupStreetLabels } from '../../utils/streetLabels';

/**
 * Hook to handle map cleanup operations
 */
export function useMapCleanup(
  map: L.Map | null,
  locationRefs: LocationRefType
) {
  const {
    userLocationMarkerRef,
    userLocationCircleRef,
    streetLabelRef
  } = locationRefs;
  
  // Remove a layer from the map safely
  const safelyRemoveLayer = useCallback((layer: L.Layer | null) => {
    if (layer && map) {
      try {
        if (map.hasLayer(layer)) {
          map.removeLayer(layer);
        }
      } catch (error) {
        console.error("Error removing layer:", error);
      }
    }
    return null;
  }, [map]);
  
  // Clean up all location layers
  const cleanupLocationLayers = useCallback(() => {
    if (!map) return;
    
    try {
      // Remove markers
      userLocationMarkerRef.current = safelyRemoveLayer(userLocationMarkerRef.current);
      userLocationCircleRef.current = safelyRemoveLayer(userLocationCircleRef.current);
      streetLabelRef.current = safelyRemoveLayer(streetLabelRef.current);
      
      // Clean up street labels
      cleanupStreetLabels();
    } catch (error) {
      console.error("Error cleaning up location layers:", error);
    }
  }, [map, safelyRemoveLayer, userLocationMarkerRef, userLocationCircleRef, streetLabelRef]);
  
  return {
    safelyRemoveLayer,
    cleanupLocationLayers
  };
}

export default useMapCleanup;
