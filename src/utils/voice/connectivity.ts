
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

  public async checkConnectionQuality(): Promise<NetworkStatus> {
    try {
      const start = performance.now();
      const response = await fetch('https://www.google.com/favicon.ico');
      const end = performance.now();
      
      if (!response.ok) {
        this.updateStatus('poor');
        return 'poor';
      }

      const latency = end - start;
      const status = latency > 1000 ? 'poor' : 'online';
      this.updateStatus(status);
      return status;
    } catch {
      this.updateStatus('offline');
      return 'offline';
    }
  }

  public updateStatus(status: NetworkStatus) {
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
