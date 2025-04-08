
import L from 'leaflet';

interface GeoLocationWatcherOptions {
  onPositionUpdate: (locationEvent: L.LocationEvent) => void;
  onError: (error: GeolocationPositionError) => void;
  map: L.Map | null;
}

export class GeoLocationWatcher {
  private options: GeoLocationWatcherOptions;
  private watchId: number | null = null;

  constructor(options: GeoLocationWatcherOptions) {
    this.options = options;
  }

  /**
   * Start high-precision location watch
   */
  public startHighAccuracyWatch(): void {
    this.stopWatch();
    
    if (!navigator.geolocation) {
      console.error("Geolocation not supported by this browser");
      return;
    }
    
    try {
      this.watchId = navigator.geolocation.watchPosition(
        this.handlePositionUpdate,
        this.handleError,
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 0 
        }
      );
      
      // Also get initial position
      navigator.geolocation.getCurrentPosition(
        this.handlePositionUpdate,
        this.handleError,
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        }
      );
      
      console.log("Started high-precision geolocation watch");
    } catch (error) {
      console.error("Error starting geolocation watch:", error);
    }
  }

  /**
   * Start standard location watch (less battery usage)
   */
  public startStandardWatch(): void {
    this.stopWatch();
    
    if (!navigator.geolocation) {
      console.error("Geolocation not supported by this browser");
      return;
    }
    
    try {
      this.watchId = navigator.geolocation.watchPosition(
        this.handlePositionUpdate,
        this.handleError,
        { 
          enableHighAccuracy: false, 
          timeout: 30000, 
          maximumAge: 60000 
        }
      );
      
      console.log("Started standard geolocation watch");
    } catch (error) {
      console.error("Error starting geolocation watch:", error);
    }
  }

  /**
   * Stop watching location
   */
  public stopWatch(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      console.log("Stopped geolocation watch");
    }
  }

  /**
   * Handle position updates from browser API
   */
  private handlePositionUpdate = (position: GeolocationPosition): void => {
    if (!this.options.map) return;
    
    try {
      const latlng = L.latLng(position.coords.latitude, position.coords.longitude);
      const accuracy = position.coords.accuracy;
      
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
      
      this.options.onPositionUpdate(locationEvent);
    } catch (error) {
      console.error("Error processing geolocation update:", error);
    }
  };

  /**
   * Handle errors from browser API
   */
  private handleError = (error: GeolocationPositionError): void => {
    this.options.onError(error);
  };

  /**
   * Use default location if geolocation fails
   */
  public useDefaultLocation(): L.LocationEvent {
    // Default to a recognizable location (San Francisco)
    const defaultLat = 37.7749;
    const defaultLng = -122.4194;
    
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
