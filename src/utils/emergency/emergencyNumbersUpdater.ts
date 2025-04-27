
/**
 * Utility for handling periodic updates to emergency number data
 */

import { emergencyNumbersCache } from '../caching/emergencyNumbersCache';

interface EmergencyNumbersUpdateConfig {
  lastUpdateTime: number;
  updateFrequency: number; // in milliseconds
  isUpdating: boolean;
  baseUrl?: string;
}

class EmergencyNumbersUpdater {
  private config: EmergencyNumbersUpdateConfig = {
    lastUpdateTime: 0,
    updateFrequency: 7 * 24 * 60 * 60 * 1000, // Default: weekly
    isUpdating: false
  };
  
  // List of high-priority countries to check for updates first
  private priorityCountries = [
    'US', 'CA', 'GB', 'AU', 'NZ', 'IN', 'DE', 'FR', 'IT', 'ES', 'JP'
  ];
  
  /**
   * Update emergency number database from remote source
   * This would typically connect to a backend API that provides the latest data
   */
  async checkForUpdates(): Promise<boolean> {
    const now = Date.now();
    
    // Don't check too frequently
    if (
      this.config.isUpdating || 
      now - this.config.lastUpdateTime < this.config.updateFrequency
    ) {
      return false;
    }
    
    try {
      this.config.isUpdating = true;
      
      // In a real implementation, you would:
      // 1. Fetch emergency numbers database from your backend
      // 2. Compare version/checksum with local data
      // 3. Update local data if needed
      
      // Simulate update check
      console.log("Checking for emergency numbers database updates...");
      
      // For now, just update the timestamp
      this.config.lastUpdateTime = now;
      
      // Clear cache to ensure fresh data is retrieved next time
      emergencyNumbersCache.clear();
      
      return true;
    } catch (error) {
      console.error("Failed to update emergency numbers database:", error);
      return false;
    } finally {
      this.config.isUpdating = false;
    }
  }
  
  /**
   * Configure update frequency and behavior
   */
  configure(options: Partial<EmergencyNumbersUpdateConfig>) {
    this.config = {
      ...this.config,
      ...options
    };
  }
  
  /**
   * Get last update timestamp
   */
  getLastUpdateTime(): number {
    return this.config.lastUpdateTime;
  }
  
  /**
   * Force an immediate update check
   */
  async forceUpdate(): Promise<boolean> {
    // Reset lastUpdateTime to ensure update happens
    this.config.lastUpdateTime = 0;
    return this.checkForUpdates();
  }
}

// Export a singleton instance
export const emergencyNumbersUpdater = new EmergencyNumbersUpdater();

// Initialize - attempt update check on load
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setTimeout(() => {
    emergencyNumbersUpdater.checkForUpdates();
  }, 5000);
}
