
interface CacheEntry {
  data: string;
  timestamp: number;
  confidence: number;
  ttl: number;
}

class ResponseCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 100;
  private defaultTtl = 5 * 60 * 1000; // 5 minutes

  public set(key: string, data: string, confidence: number = 0.8, ttl?: number): void {
    // Clean up old entries if cache is getting full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      confidence,
      ttl: ttl || this.defaultTtl
    };

    this.cache.set(this.normalizeKey(key), entry);
  }

  public get(key: string): string | null {
    const entry = this.cache.get(this.normalizeKey(key));
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(this.normalizeKey(key));
      return null;
    }

    return entry.data;
  }

  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  public clear(): void {
    this.cache.clear();
  }

  public getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        confidence: entry.confidence,
        age: Date.now() - entry.timestamp
      }))
    };
  }

  private normalizeKey(key: string): string {
    return key.toLowerCase().trim();
  }

  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Remove expired entries first
    for (const [key, entry] of entries) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }

    // If still too many entries, remove oldest low-confidence entries
    if (this.cache.size >= this.maxSize) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort((a, b) => {
          // Sort by confidence (ascending) then by age (descending)
          const confidenceDiff = a[1].confidence - b[1].confidence;
          if (confidenceDiff !== 0) return confidenceDiff;
          return b[1].timestamp - a[1].timestamp;
        });

      const toRemove = sortedEntries.slice(0, Math.floor(this.maxSize * 0.2));
      toRemove.forEach(([key]) => {
        this.cache.delete(key);
      });
    }
  }
}

export const responseCache = new ResponseCache();
