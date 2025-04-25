
interface CachedResponse {
  text: string;
  timestamp: number;
  confidence: number;
}

class ResponseCacheService {
  private cache: Map<string, CachedResponse> = new Map();
  private readonly DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private maxCacheEntries = 100; // Default max cache size
  
  /**
   * Add a response to the cache
   */
  public set(command: string, response: string, confidence: number, ttl?: number) {
    // Handle cache size limits
    if (this.cache.size >= this.maxCacheEntries) {
      this.pruneCache();
    }
    
    this.cache.set(command, {
      text: response,
      timestamp: Date.now(),
      confidence
    });
  }

  /**
   * Get a response from the cache if it exists and is not expired
   * @returns The cached response text or null if not found or expired
   */
  public get(command: string, minConfidence = 0): string | null {
    const cached = this.cache.get(command);
    if (!cached) return null;

    // Check for expiration
    if (Date.now() - cached.timestamp > this.DEFAULT_CACHE_DURATION) {
      this.cache.delete(command);
      return null;
    }
    
    // Check confidence threshold
    if (cached.confidence < minConfidence) {
      return null;
    }

    return cached.text;
  }

  /**
   * Remove all expired entries from the cache
   */
  public pruneExpired(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.DEFAULT_CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Remove entries to keep cache size under limit
   * Removes oldest entries first
   */
  private pruneCache(): void {
    // First remove any expired entries
    this.pruneExpired();
    
    // If still over limit, remove oldest entries
    if (this.cache.size >= this.maxCacheEntries) {
      // Convert to array to sort by timestamp
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Remove oldest entries until under limit
      const entriesToRemove = entries.slice(0, entries.length - this.maxCacheEntries + 10);
      for (const [key] of entriesToRemove) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear the entire cache
   */
  public clear() {
    this.cache.clear();
  }
  
  /**
   * Set maximum number of entries to cache
   */
  public setMaxEntries(max: number) {
    this.maxCacheEntries = max;
    if (this.cache.size > max) {
      this.pruneCache();
    }
  }
}

export const responseCache = new ResponseCacheService();
