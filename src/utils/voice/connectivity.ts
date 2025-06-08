
export interface NetworkStatus {
  isOnline: boolean;
  quality: 'poor' | 'good' | 'excellent';
  timestamp: number;
}

export class ConnectivityService {
  private status: NetworkStatus = {
    isOnline: navigator.onLine,
    quality: 'good',
    timestamp: Date.now()
  };

  async checkConnectionQuality(): Promise<NetworkStatus> {
    this.status = {
      isOnline: navigator.onLine,
      quality: navigator.onLine ? 'good' : 'poor',
      timestamp: Date.now()
    };
    return this.status;
  }

  getCurrentStatus(): NetworkStatus {
    return { ...this.status };
  }

  updateStatus(status: 'online' | 'offline'): void {
    this.status.isOnline = status === 'online';
    this.status.timestamp = Date.now();
  }
}

export const connectivityService = new ConnectivityService();
