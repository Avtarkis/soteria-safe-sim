
import L from 'leaflet';
import { DEFAULT_LOCATIONS } from './locationDefaults';

interface GeoLocationOptions {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
}

export type GeoLocationCallback = (position: GeolocationPosition) => void;
export type GeoLocationErrorCallback = (error: GeolocationPositionError) => void;

/**
 * Core handler for browser's geolocation API
 */
export class GeoLocationHandler {
  private watchId: number | null = null;
  private onSuccess: GeoLocationCallback;
  private onError: GeoLocationErrorCallback;
  
  constructor(onSuccess: GeoLocationCallback, onError: GeoLocationErrorCallback) {
    this.onSuccess = onSuccess;
    this.onError = onError;
  }
  
  /**
   * Get geolocation options based on accuracy mode
   */
  private getOptions(highAccuracy: boolean): GeoLocationOptions {
    return {
      enableHighAccuracy: highAccuracy,
      timeout: highAccuracy ? 10000 : 8000,
      maximumAge: highAccuracy ? 0 : 5000
    };
  }
  
  /**
   * Start watching position with specified accuracy
   */
  public startWatch(highAccuracy: boolean = true): void {
    this.stopWatch();
    
    if (!navigator.geolocation) {
      this.onError({
        code: 2,
        message: "Geolocation not supported by this browser",
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      });
      return;
    }
    
    try {
      // Get initial position first
      navigator.geolocation.getCurrentPosition(
        this.onSuccess,
        this.onError,
        this.getOptions(highAccuracy)
      );
      
      // Then start watching
      this.watchId = navigator.geolocation.watchPosition(
        this.onSuccess,
        this.onError,
        this.getOptions(highAccuracy)
      );
      
      console.log(`Started ${highAccuracy ? 'high-accuracy' : 'standard'} geolocation watch`);
    } catch (error) {
      console.error("Error starting geolocation watch:", error);
      this.onError({
        code: 2,
        message: `Error starting watch: ${error}`,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      });
    }
  }
  
  /**
   * Stop watching position
   */
  public stopWatch(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      console.log("Stopped geolocation watch");
    }
  }
  
  /**
   * Generate a default location for fallback
   */
  public getDefaultLocation(): GeolocationPosition {
    let defaultLoc = DEFAULT_LOCATIONS.USA;
    
    try {
      // Try to guess region from timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      if (timezone.includes('Europe')) {
        defaultLoc = DEFAULT_LOCATIONS.Europe;
      } else if (timezone.includes('Asia')) {
        defaultLoc = DEFAULT_LOCATIONS.Asia;
      } else if (timezone.includes('Australia')) {
        defaultLoc = DEFAULT_LOCATIONS.Australia;
      }
    } catch (e) {
      console.log("Could not determine location from timezone");
    }
    
    // Create synthetic position object
    return {
      coords: {
        latitude: defaultLoc.lat,
        longitude: defaultLoc.lng,
        accuracy: 5000,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        // Add required toJSON method
        toJSON: function() {
          return {
            latitude: this.latitude,
            longitude: this.longitude,
            accuracy: this.accuracy,
            altitude: this.altitude,
            altitudeAccuracy: this.altitudeAccuracy,
            heading: this.heading,
            speed: this.speed
          };
        }
      },
      timestamp: Date.now(),
      // Add required toJSON method to the position object
      toJSON: function() {
        return {
          coords: this.coords.toJSON(),
          timestamp: this.timestamp
        };
      }
    };
  }
}
