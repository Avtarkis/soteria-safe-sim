
import L from 'leaflet';
import { LocationUpdater } from './LocationUpdater';

/**
 * Responsible for tracking user location
 */
export class LocationTracker {
  private map: L.Map;
  private updater: LocationUpdater;
  private watchId: number | null = null;
  private errorCount: number = 0;
  private active: boolean = false;
  private initializing: boolean = false;

  constructor(map: L.Map, updater: LocationUpdater) {
    this.map = map;
    this.updater = updater;
  }

  /**
   * Start tracking user location with high accuracy
   */
  public startTracking(highAccuracy: boolean = true): void {
    this.stopTracking(); // Stop any existing tracking
    this.initializing = true;
    this.active = true;
    this.errorCount = 0;
    
    try {
      console.log(`Starting location tracking (high accuracy: ${highAccuracy})`);
      
      // Start map's built-in location tracking
      this.map.locate({ 
        setView: false,
        maxZoom: 19, 
        watch: true,
        enableHighAccuracy: highAccuracy,
        timeout: 8000,
        maximumAge: highAccuracy ? 0 : 5000
      });
      
      // Also start browser geolocation tracking as fallback
      this.startBrowserGeolocation(highAccuracy);
      
      this.initializing = false;
    } catch (error) {
      console.error("Error starting location tracking:", error);
      this.errorCount++;
      this.initializing = false;
      
      // Fallback to standard accuracy if high accuracy fails
      if (highAccuracy && this.errorCount < 3) {
        console.log("Falling back to standard accuracy");
        this.startTracking(false);
      }
    }
  }

  /**
   * Start browser geolocation tracking
   */
  private startBrowserGeolocation(highAccuracy: boolean): void {
    try {
      if (!navigator.geolocation) {
        console.warn("Geolocation not supported by this browser");
        return;
      }
      
      this.watchId = navigator.geolocation.watchPosition(
        (position) => this.handleBrowserPosition(position),
        (error) => this.handleBrowserPositionError(error),
        { 
          enableHighAccuracy: highAccuracy, 
          timeout: highAccuracy ? 8000 : 5000, 
          maximumAge: highAccuracy ? 0 : 5000
        }
      );
    } catch (error) {
      console.error("Error starting browser geolocation:", error);
    }
  }

  /**
   * Handle browser position update
   */
  private handleBrowserPosition(position: GeolocationPosition): void {
    if (!this.active || !this.map) return;
    
    try {
      // Convert browser position to Leaflet format
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
      
      this.updater.updateLocation(locationEvent);
    } catch (error) {
      console.error("Error handling browser position:", error);
      this.errorCount++;
    }
  }

  /**
   * Handle browser position error
   */
  private handleBrowserPositionError(error: GeolocationPositionError): void {
    console.warn("Browser geolocation error:", error.message);
    this.errorCount++;
    
    // Stop tracking after too many errors
    if (this.errorCount > 5) {
      console.error("Too many errors during location tracking, stopping");
      this.stopTracking();
    }
  }

  /**
   * Handle location error from the map API
   */
  public handleLocationError(error: L.ErrorEvent): void {
    console.warn("Map location error:", error.message);
    this.errorCount++;
    
    // Stop tracking after too many errors
    if (this.errorCount > 5) {
      console.error("Too many errors during location tracking, stopping");
      this.stopTracking();
    }
  }

  /**
   * Stop tracking user location
   */
  public stopTracking(): void {
    this.active = false;
    
    try {
      // Stop map's built-in location tracking
      if (this.map) {
        this.map.stopLocate();
      }
      
      // Stop browser geolocation tracking
      if (this.watchId !== null) {
        navigator.geolocation.clearWatch(this.watchId);
        this.watchId = null;
      }
    } catch (error) {
      console.error("Error stopping location tracking:", error);
    }
  }
  
  /**
   * Check if location tracking is active
   */
  public isActive(): boolean {
    return this.active;
  }
  
  /**
   * Check if location tracking is initializing
   */
  public isInitializing(): boolean {
    return this.initializing;
  }
  
  /**
   * Get current error count
   */
  public getErrorCount(): number {
    return this.errorCount;
  }
}
