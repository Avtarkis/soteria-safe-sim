
/**
 * Dispatches a user location update event
 */
export const dispatchLocationUpdate = (
  lat: number, 
  lng: number, 
  accuracy: number, 
  safetyLevel: 'safe' | 'caution' | 'danger' = 'safe'
): void => {
  try {
    const customEvent = new CustomEvent('userLocationUpdated', {
      detail: {
        lat,
        lng,
        accuracy,
        safetyLevel
      }
    });
    document.dispatchEvent(customEvent);
  } catch (error) {
    console.error("Error dispatching location event:", error);
  }
};

/**
 * Activates high precision mode
 */
export const activateHighPrecisionMode = (): void => {
  try {
    document.dispatchEvent(new CustomEvent('highPrecisionModeActivated'));
  } catch (error) {
    console.error("Error dispatching high precision mode event:", error);
  }
};

/**
 * Dispatches an event to center the map on user location
 */
export const centerMapOnUserLocation = (): void => {
  try {
    document.dispatchEvent(new CustomEvent('centerMapOnUserLocation'));
  } catch (error) {
    console.error("Error dispatching center map event:", error);
  }
};
