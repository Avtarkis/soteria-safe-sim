
// Default locations for various regions
export const DEFAULT_LOCATIONS = {
  USA: { lat: 37.0902, lng: -95.7129 },
  Europe: { lat: 51.5074, lng: -0.1278 }, // London
  Asia: { lat: 35.6762, lng: 139.6503 },  // Tokyo
  Australia: { lat: -33.8688, lng: 151.2093 } // Sydney
};

// Default position accuracy thresholds
export const ACCURACY_THRESHOLDS = {
  HIGH: 20,    // High accuracy in meters
  MEDIUM: 100, // Medium accuracy in meters
  LOW: 500     // Low accuracy in meters
};

// Zoom levels for different position accuracies
export const ZOOM_LEVELS = {
  HIGH_ACCURACY: 18,
  MEDIUM_ACCURACY: 15,
  LOW_ACCURACY: 13,
  DEFAULT: 10
};

// Location update interval in milliseconds
export const UPDATE_INTERVALS = {
  HIGH_PRECISION: 2000,
  STANDARD: 5000
};
