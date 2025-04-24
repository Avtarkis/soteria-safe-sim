
import { connectivityService, NetworkStatus } from './connectivity';

/**
 * Enhanced network status monitoring with automatic retry capabilities
 */
export class NetworkStatusMonitor {
  private static listeners: Set<(status: NetworkStatus) => void> = new Set();
  private static monitoringActive = false;
  private static retryInterval: number | null = null;
  private static retryAttempts = 0;
  private static maxRetryAttempts = 3;
  
  /**
   * Starts monitoring network status with periodic checks
   */
  public static startMonitoring(checkIntervalMs = 10000): void {
    if (this.monitoringActive) return;
    
    this.monitoringActive = true;
    
    // Perform initial check
    this.checkNetworkStatus();
    
    // Set up periodic checks
    setInterval(() => {
      this.checkNetworkStatus();
    }, checkIntervalMs);
    
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    console.log('Network status monitoring started');
  }
  
  /**
   * Stops active network monitoring
   */
  public static stopMonitoring(): void {
    if (!this.monitoringActive) return;
    
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
      this.retryInterval = null;
    }
    
    this.monitoringActive = false;
    console.log('Network status monitoring stopped');
  }
  
  /**
   * Checks current network status
   */
  private static checkNetworkStatus(): void {
    connectivityService.checkConnectionQuality().then(() => {
      // Reset retry attempts on successful check
      this.retryAttempts = 0;
      
      // Stop retry interval if it was running
      if (this.retryInterval) {
        clearInterval(this.retryInterval);
        this.retryInterval = null;
      }
    }).catch(error => {
      console.warn('Network check failed:', error);
      this.startRetrying();
    });
  }
  
  /**
   * Start retry mechanism when network check fails
   */
  private static startRetrying(): void {
    // Don't start a new retry interval if one is already running
    if (this.retryInterval) return;
    
    // Exponential backoff for retries (1s, 2s, 4s)
    const backoffTime = Math.min(1000 * Math.pow(2, this.retryAttempts), 5000);
    
    this.retryInterval = window.setInterval(() => {
      if (this.retryAttempts >= this.maxRetryAttempts) {
        // Stop retrying after max attempts
        if (this.retryInterval) {
          clearInterval(this.retryInterval);
          this.retryInterval = null;
        }
        return;
      }
      
      console.log(`Retry attempt ${this.retryAttempts + 1}/${this.maxRetryAttempts}`);
      this.retryAttempts++;
      this.checkNetworkStatus();
    }, backoffTime);
  }
  
  /**
   * Handle online event
   */
  private static handleOnline = (): void => {
    console.log('Browser reports online status');
    this.checkNetworkStatus();
  };
  
  /**
   * Handle offline event
   */
  private static handleOffline = (): void => {
    console.log('Browser reports offline status');
    connectivityService.updateStatus('offline');
  };
  
  /**
   * Subscribe to network status changes
   * @returns Unsubscribe function
   */
  public static subscribe(callback: (status: NetworkStatus) => void): () => void {
    this.listeners.add(callback);
    
    // Trigger callback with current status
    callback(connectivityService.getCurrentStatus());
    
    // Start monitoring if this is the first subscriber
    if (this.listeners.size === 1 && !this.monitoringActive) {
      this.startMonitoring();
    }
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
      
      // Stop monitoring if there are no more subscribers
      if (this.listeners.size === 0 && this.monitoringActive) {
        this.stopMonitoring();
      }
    };
  }
}
