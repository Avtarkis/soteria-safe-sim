
import L from 'leaflet';
import { cleanupStreetLabels } from './streetLabels';
import { MutableRefObject } from 'react';

export const cleanupLocationLayers = (
  map: L.Map | null,
  userLocationMarkerRef: MutableRefObject<L.Marker | null>,
  userLocationCircleRef: MutableRefObject<L.Circle | null>,
  streetLabelRef: MutableRefObject<L.Marker | null>,
  safelyRemoveLayer: (layer: L.Layer | null) => null
) => {
  if (!map) return;
  
  try {
    userLocationMarkerRef.current = safelyRemoveLayer(userLocationMarkerRef.current);
    userLocationCircleRef.current = safelyRemoveLayer(userLocationCircleRef.current);
    streetLabelRef.current = safelyRemoveLayer(streetLabelRef.current);
    
    // Additional cleanup for street labels
    cleanupStreetLabels();
  } catch (error) {
    console.error("Error in location layers cleanup:", error);
  }
};
