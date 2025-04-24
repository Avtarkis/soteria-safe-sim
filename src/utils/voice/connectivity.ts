
export type NetworkStatus = 'online' | 'offline' | 'poor';

class ConnectivityService {
  private listeners: Set<(status: NetworkStatus) => void> = new Set();
  private connectionQuality: NetworkStatus = 'online';

  constructor() {
    this.initializeListeners();
  }

  private initializeListeners() {
    window.addEventListener('online', () => this.updateStatus('online'));
    window.addEventListener('offline', () => this.updateStatus('offline'));
    
    // Check connection quality periodically
    setInterval(() => this.checkConnectionQuality(), 10000);
  }

  private async checkConnectionQuality(): Promise<void> {
    try {
      const start = performance.now();
      const response = await fetch('https://www.google.com/favicon.ico');
      const end = performance.now();
      
      if (!response.ok) {
        this.updateStatus('poor');
        return;
      }

      const latency = end - start;
      this.updateStatus(latency > 1000 ? 'poor' : 'online');
    } catch {
      this.updateStatus('offline');
    }
  }

  private updateStatus(status: NetworkStatus) {
    this.connectionQuality = status;
    this.notifyListeners();
  }

  public getCurrentStatus(): NetworkStatus {
    return this.connectionQuality;
  }

  public subscribe(callback: (status: NetworkStatus) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.connectionQuality));
  }
}

export const connectivityService = new ConnectivityService();
