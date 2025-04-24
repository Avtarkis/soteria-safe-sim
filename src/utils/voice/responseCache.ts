
interface CachedResponse {
  text: string;
  timestamp: number;
  confidence: number;
}

class ResponseCacheService {
  private cache: Map<string, CachedResponse> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  public set(command: string, response: string, confidence: number) {
    this.cache.set(command, {
      text: response,
      timestamp: Date.now(),
      confidence
    });
  }

  public get(command: string): string | null {
    const cached = this.cache.get(command);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(command);
      return null;
    }

    return cached.text;
  }

  public clear() {
    this.cache.clear();
  }
}

export const responseCache = new ResponseCacheService();
