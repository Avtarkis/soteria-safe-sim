
import { useEffect } from 'react';
import L from 'leaflet';

interface CenterMapHandlerProps {
  map: L.Map | null;
  userLocation: [number, number] | null;
}

/**
 * Component that handles centering the map on the user's location
 */
const CenterMapHandler = ({ map, userLocation }: CenterMapHandlerProps) => {
  // Register event handler for centering map on user location
  useEffect(() => {
    if (!map || !userLocation) return;

    const handleCenterMap = (e: CustomEvent) => {
      try {
        if (map && userLocation) {
          map.flyTo([userLocation[0], userLocation[1]], 16, {
            animate: true,
            duration: 1
          });
        }
      } catch (error) {
        console.error("Error centering map on event:", error);
      }
    };

    document.addEventListener('centerMapOnUserLocation', handleCenterMap as EventListener);
    
    return () => {
      document.removeEventListener('centerMapOnUserLocation', handleCenterMap as EventListener);
    };
  }, [map, userLocation]);
  
  return null; // This is a non-visual component
};

export default CenterMapHandler;
