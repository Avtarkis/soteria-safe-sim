
import L from 'leaflet';

interface GeoLocationWatcherOptions {
  onPositionUpdate: (locationEvent: L.LocationEvent) => void;
  onError: (error: GeolocationPositionError) => void;
  map: L.Map | null;
}

export class GeoLocationWatcher {
  private options: GeoLocationWatcherOptions;
  private watchId: number | null = null;
  private retryAttempts: number = 0;
  private maxRetries: number = 3;
  private retryTimeoutId: number | null = null;
  private highPrecisionMode: boolean = false;

  constructor(options: GeoLocationWatcherOptions) {
    this.options = options;
  }

  /**
   * Start high-precision location watch
   */
  public startHighAccuracyWatch(): void {
    if (this.highPrecisionMode) return; // Prevent multiple activations
    
    this.stopWatch();
    this.retryAttempts = 0;
    this.highPrecisionMode = true;
    
    if (!navigator.geolocation) {
      console.error("Geolocation not supported by this browser");
      return;
    }
    
    try {
      // Create a custom event that other components can listen for
      document.dispatchEvent(new CustomEvent('highPrecisionModeActivated'));
      
      // Get initial position first
      navigator.geolocation.getCurrentPosition(
        this.handlePositionUpdate,
        (error) => {
          this.handleError(error);
          // Immediately try again with standard accuracy if high accuracy fails initially
          this.startStandardWatch();
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 0 
        }
      );
      
      // Then start watching with less frequent updates (increased maximumAge)
      this.watchId = navigator.geolocation.watchPosition(
        this.handlePositionUpdate,
        (error) => {
          this.handleError(error);
          this.retryHighAccuracyWithBackoff();
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 10000 // Increased to reduce update frequency 
        }
      );
      
      console.log("Started high-precision geolocation watch");
    } catch (error) {
      console.error("Error starting geolocation watch:", error);
      this.startStandardWatch(); // Fallback to standard watch
    }
  }

  /**
   * Retry high accuracy watch with exponential backoff
   */
  private retryHighAccuracyWithBackoff(): void {
    if (this.retryAttempts < this.maxRetries) {
      this.retryAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.retryAttempts), 10000);
      
      console.log(`Retrying high accuracy location in ${delay}ms (attempt ${this.retryAttempts})`);
      
      if (this.retryTimeoutId !== null) {
        window.clearTimeout(this.retryTimeoutId);
      }
      
      this.retryTimeoutId = window.setTimeout(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            this.handlePositionUpdate,
            (error) => {
              this.handleError(error);
              if (this.retryAttempts >= this.maxRetries) {
                console.log("Max retries reached, falling back to standard accuracy");
                this.startStandardWatch();
              } else {
                this.retryHighAccuracyWithBackoff();
              }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        }
      }, delay);
    } else {
      // After max retries, fall back to standard accuracy
      this.startStandardWatch();
    }
  }

  /**
   * Start standard location watch (less battery usage)
   */
  public startStandardWatch(): void {
    this.stopWatch();
    this.highPrecisionMode = false;
    
    if (!navigator.geolocation) {
      console.error("Geolocation not supported by this browser");
      return;
    }
    
    try {
      // Try to get a quick initial position
      navigator.geolocation.getCurrentPosition(
        this.handlePositionUpdate,
        this.handleError,
        { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 }
      );
      
      this.watchId = navigator.geolocation.watchPosition(
        this.handlePositionUpdate,
        this.handleError,
        { 
          enableHighAccuracy: false, 
          timeout: 30000, 
          maximumAge: 60000 // Increased to reduce update frequency
        }
      );
      
      console.log("Started standard geolocation watch");
    } catch (error) {
      console.error("Error starting geolocation watch:", error);
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
      
      // Dispatch an event that other components can listen for
      document.dispatchEvent(new CustomEvent('userLocationUpdated', {
        detail: { lat: position.coords.latitude, lng: position.coords.longitude, accuracy }
      }));
      
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
    this.options.onError(error);
  };

  /**
   * Use default location if geolocation fails
   */
  public useDefaultLocation(): L.LocationEvent {
    // Try to determine location based on browser language or timezone if available
    let defaultLat = 37.7749;
    let defaultLng = -122.4194;
    
    try {
      // Try to guess region from timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      if (timezone.includes('Europe')) {
        defaultLat = 51.5074; // London
        defaultLng = -0.1278;
      } else if (timezone.includes('Asia')) {
        defaultLat = 35.6762; // Tokyo
        defaultLng = 139.6503;
      } else if (timezone.includes('Australia')) {
        defaultLat = -33.8688; // Sydney
        defaultLng = 151.2093;
      }
      
      console.log("Using location based on timezone:", timezone, defaultLat, defaultLng);
    } catch (e) {
      console.log("Could not determine location from timezone, using fallback");
    }
    
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
