
// Helper functions for device location

/**
 * Get the current device location
 */
export const getDeviceLocation = async (): Promise<GeolocationPosition | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(position);
      },
      (error) => {
        console.error('Error getting location:', error);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
};

/**
 * Format coordinates into a readable string
 */
export const formatCoordinates = (latitude: number, longitude: number): string => {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
};

/**
 * Get a maps URL for the given coordinates
 */
export const getMapsUrl = (latitude: number, longitude: number): string => {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
};
