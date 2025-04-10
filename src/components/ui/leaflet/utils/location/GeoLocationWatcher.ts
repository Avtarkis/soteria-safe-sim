
import L from 'leaflet';
import { GeoLocationHandler } from './GeoLocationHandler';
import { dispatchLocationUpdate } from '../locationEvents';

interface GeoLocationWatcherOptions {
  onPositionUpdate: (locationEvent: L.LocationEvent) => void;
  onError: (error: GeolocationPositionError) => void;
  map: L.Map | null;
}

/**
 * Enhanced geolocation watcher with retry logic and event handling
 */
export class GeoLocationWatcher {
  private options: GeoLocationWatcherOptions;
  private handler: GeoLocationHandler;
  private retryAttempts: number = 0;
  private maxRetries: number = 3;
  private retryTimeoutId: number | null = null;
  private highPrecisionMode: boolean = false;

  constructor(options: GeoLocationWatcherOptions) {
    this.options = options;
    
    // Create handler with callbacks
    this.handler = new GeoLocationHandler(
      this.handlePositionUpdate,
      this.handleError
    );
  }

  /**
   * Start high-precision location watch
   */
  public startHighAccuracyWatch(): void {
    if (this.highPrecisionMode) return; // Prevent multiple activations
    
    this.retryAttempts = 0;
    this.highPrecisionMode = true;
    
    try {
      // Notify other components
      document.dispatchEvent(new CustomEvent('highPrecisionModeActivated'));
      
      // Start the watch
      this.handler.startWatch(true);
      
      console.log("Started high-precision geolocation watch");
    } catch (error) {
      console.error("Error starting geolocation watch:", error);
      this.startStandardWatch(); // Fallback to standard watch
    }
  }

  /**
   * Start standard location watch (less battery usage)
   */
  public startStandardWatch(): void {
    this.highPrecisionMode = false;
    
    try {
      this.handler.startWatch(false);
      console.log("Started standard geolocation watch");
    } catch (error) {
      console.error("Error starting standard geolocation watch:", error);
      // If even standard watch fails, use default location
      const defaultLocation = this.useDefaultLocation();
      this.options.onPositionUpdate(defaultLocation);
    }
  }

  /**
   * Stop watching location
   */
  public stopWatch(): void {
    // Clear retry timeout if exists
    if (this.retryTimeoutId !== null) {
      window.clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }
    
    // Stop the geolocation watch
    this.handler.stopWatch();
  }

  /**
   * Handle position updates from browser API
   */
  private handlePositionUpdate = (position: GeolocationPosition): void => {
    if (!this.options.map) return;
    
    try {
      const latlng = L.latLng(position.coords.latitude, position.coords.longitude);
      const accuracy = position.coords.accuracy;
      
      // Reset retry attempts on successful update
      this.retryAttempts = 0;
      
      // Create a synthetic location event
      const locationEvent = {
        latlng,
        accuracy,
        timestamp: position.timestamp,
        bounds: L.latLngBounds(
          [position.coords.latitude - 0.0001, position.coords.longitude - 0.0001],
          [position.coords.latitude + 0.0001, position.coords.longitude + 0.0001]
        )
      } as L.LocationEvent;
      
      // Dispatch global event
      dispatchLocationUpdate(position.coords.latitude, position.coords.longitude, accuracy);
      
      // Call the provided callback
      this.options.onPositionUpdate(locationEvent);
    } catch (error) {
      console.error("Error processing geolocation update:", error);
    }
  };

  /**
   * Handle errors from browser API
   */
  private handleError = (error: GeolocationPositionError): void => {
    console.error("Geolocation error:", error.message);
    
    // Increment retry counter
    this.retryAttempts++;
    
    // Try a few times before giving up
    if (this.retryAttempts < this.maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, this.retryAttempts), 10000);
      
      console.log(`Retrying geolocation in ${delay}ms (attempt ${this.retryAttempts})`);
      
      if (this.retryTimeoutId !== null) {
        window.clearTimeout(this.retryTimeoutId);
      }
      
      this.retryTimeoutId = window.setTimeout(() => {
        if (this.highPrecisionMode) {
          this.handler.startWatch(true);
        } else {
          this.startStandardWatch();
        }
      }, delay);
    } else {
      // After max retries, fall back to standard accuracy
      if (this.highPrecisionMode) {
        console.log("Max retries reached, falling back to standard accuracy");
        this.startStandardWatch();
      } else {
        // If even standard mode fails, use default location
        const defaultLocation = this.useDefaultLocation();
        this.options.onPositionUpdate(defaultLocation);
      }
    }
    
    // Also call the provided error callback
    this.options.onError(error);
  };

  /**
   * Use default location if geolocation fails
   */
  public useDefaultLocation(): L.LocationEvent {
    // Get default location from handler
    const defaultPosition = this.handler.getDefaultLocation();
    const defaultLat = defaultPosition.coords.latitude;
    const defaultLng = defaultPosition.coords.longitude;
    
    console.log("Using default location:", defaultLat, defaultLng);
    
    return {
      latlng: L.latLng(defaultLat, defaultLng),
      accuracy: 5000, // High accuracy value to indicate low precision
      timestamp: Date.now(),
      bounds: L.latLngBounds(
        [defaultLat - 0.1, defaultLng - 0.1],
        [defaultLat + 0.1, defaultLng + 0.1]
      )
    } as L.LocationEvent;
  }
}
