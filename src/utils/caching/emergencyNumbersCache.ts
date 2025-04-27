
/**
 * Cache utility for emergency numbers to reduce API calls
 * and improve performance for frequently accessed countries
 */

interface CachedEmergencyNumber {
  data: any;
  timestamp: number;
  source: 'api' | 'local' | 'fallback';
}

class EmergencyNumbersCache {
  private cache: Map<string, CachedEmergencyNumber> = new Map();
  private readonly DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly LOCATION_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for location-based cache

  /**
   * Store emergency numbers in cache
   */
  set(countryCode: string, data: any, source: 'api' | 'local' | 'fallback' = 'api') {
    this.cache.set(countryCode.toUpperCase(), {
      data,
      timestamp: Date.now(),
      source
    });
    
    // Log caching events (remove in production)
    console.log(`Cached emergency numbers for ${countryCode} from ${source} source`);
  }

  /**
   * Get emergency numbers from cache if available and not expired
   */
  get(countryCode: string): any | null {
    const cacheKey = countryCode.toUpperCase();
    const cached = this.cache.get(cacheKey);
    
    if (!cached) {
      return null;
    }

    const now = Date.now();
    const maxAge = cached.source === 'local' 
      ? this.DEFAULT_CACHE_DURATION
      : this.LOCATION_CACHE_DURATION;
    
    // Check if cache is expired
    if (now - cached.timestamp > maxAge) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Cache entry for location-based queries
   * These have shorter TTL as user may move around
   */
  setLocationBased(latitude: number, longitude: number, countryCode: string, data: any) {
    const locationKey = `LAT:${latitude.toFixed(1)},LNG:${longitude.toFixed(1)}`;
    this.cache.set(locationKey, {
      data,
      timestamp: Date.now(),
      source: 'local'
    });
    
    // Also cache by country code for future reuse
    this.set(countryCode, data, 'local');
  }

  /**
   * Get cached entry based on geolocation
   */
  getLocationBased(latitude: number, longitude: number): any | null {
    const locationKey = `LAT:${latitude.toFixed(1)},LNG:${longitude.toFixed(1)}`;
    return this.get(locationKey);
  }

  /**
   * Clear entire cache or specific country
   */
  clear(countryCode?: string) {
    if (countryCode) {
      this.cache.delete(countryCode.toUpperCase());
    } else {
      this.cache.clear();
    }
  }

  /**
   * Clean expired entries from cache
   */
  cleanExpired() {
    const now = Date.now();
    
    for (const [key, value] of this.cache.entries()) {
      const maxAge = value.source === 'local' 
        ? this.DEFAULT_CACHE_DURATION 
        : this.LOCATION_CACHE_DURATION;
      
      if (now - value.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }
  }
}

// Export a singleton instance
export const emergencyNumbersCache = new EmergencyNumbersCache();
