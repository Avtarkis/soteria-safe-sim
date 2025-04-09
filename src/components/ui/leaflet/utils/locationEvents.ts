
import L from 'leaflet';

/**
 * Register map centering event listeners
 * @param map Leaflet map instance
 */
export function registerLocationEventListeners(map: L.Map | null) {
  if (!map) return;
  
  // Handle centering map on user location
  const handleCenterOnUser = (e: CustomEvent) => {
    if (!map) return;
    
    try {
      const { lat, lng } = e.detail;
      map.flyTo([lat, lng], 16, {
        animate: true,
        duration: 1
      });
    } catch (error) {
      console.error("Error centering map on user:", error);
    }
  };
  
  // Handle centering map on threat location
  const handleCenterOnThreat = (e: CustomEvent) => {
    if (!map) return;
    
    try {
      const { lat, lng } = e.detail;
      map.flyTo([lat, lng], 15, {
        animate: true,
        duration: 1
      });
    } catch (error) {
      console.error("Error centering map on threat:", error);
    }
  };
  
  // Register event listeners
  document.addEventListener('centerMapOnUserLocation', handleCenterOnUser as EventListener);
  document.addEventListener('centerMapOnThreat', handleCenterOnThreat as EventListener);
  
  // Return cleanup function
  return () => {
    document.removeEventListener('centerMapOnUserLocation', handleCenterOnUser as EventListener);
    document.removeEventListener('centerMapOnThreat', handleCenterOnThreat as EventListener);
  };
}

/**
 * Dispatch event to center map on user location
 * @param lat Latitude
 * @param lng Longitude
 */
export function centerMapOnUser(lat: number, lng: number) {
  const event = new CustomEvent('centerMapOnUserLocation', {
    detail: { lat, lng }
  });
  document.dispatchEvent(event);
}

/**
 * Dispatch event to center map on threat location
 * @param lat Latitude
 * @param lng Longitude
 */
export function centerMapOnThreat(lat: number, lng: number) {
  const event = new CustomEvent('centerMapOnThreat', {
    detail: { lat, lng }
  });
  document.dispatchEvent(event);
}
