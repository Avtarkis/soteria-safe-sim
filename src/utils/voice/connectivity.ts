
export interface ConnectivityStatus {
  isOnline: boolean;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
}

class ConnectivityService {
  private status: 'online' | 'offline' | 'poor' = 'online';
  private listeners: Array<(status: 'online' | 'offline' | 'poor') => void> = [];

  constructor() {
    this.initializeListeners();
    this.checkInitialStatus();
  }

  private initializeListeners() {
    window.addEventListener('online', () => {
      this.updateStatus('online');
    });

    window.addEventListener('offline', () => {
      this.updateStatus('offline');
    });

    // Monitor connection quality if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', () => {
        this.assessConnectionQuality();
      });
    }
  }

  private checkInitialStatus() {
    if (!navigator.onLine) {
      this.status = 'offline';
    } else {
      this.assessConnectionQuality();
    }
  }

  private assessConnectionQuality() {
    if (!navigator.onLine) {
      this.updateStatus('offline');
      return;
    }

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const effectiveType = connection.effectiveType;
      
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        this.updateStatus('poor');
      } else {
        this.updateStatus('online');
      }
    } else {
      this.updateStatus('online');
    }
  }

  private updateStatus(newStatus: 'online' | 'offline' | 'poor') {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.notifyListeners();
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.status);
      } catch (error) {
        console.error('Error in connectivity listener:', error);
      }
    });
  }

  public getCurrentStatus(): 'online' | 'offline' | 'poor' {
    return this.status;
  }

  public subscribe(listener: (status: 'online' | 'offline' | 'poor') => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public getDetailedStatus(): ConnectivityStatus {
    const isOnline = navigator.onLine;
    let connectionType: ConnectivityStatus['connectionType'] = 'unknown';
    let effectiveType: ConnectivityStatus['effectiveType'] = 'unknown';

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connectionType = connection.type || 'unknown';
      effectiveType = connection.effectiveType || 'unknown';
    }

    return {
      isOnline,
      connectionType,
      effectiveType
    };
  }
}

export const connectivityService = new ConnectivityService();
