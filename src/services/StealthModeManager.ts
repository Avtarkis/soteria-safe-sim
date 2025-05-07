
import { toast } from '@/hooks/use-toast';

export class StealthModeManager {
  private isStealthActive = false;
  private originalTitle: string;
  private originalFavicon: string | null = null;
  private hiddenDiv: HTMLDivElement | null = null;
  private listeners: ((isActive: boolean) => void)[] = [];
  
  constructor() {
    this.originalTitle = document.title;
    
    // Get the original favicon
    const faviconEl = document.querySelector('link[rel="icon"]');
    if (faviconEl) {
      this.originalFavicon = faviconEl.getAttribute('href');
    }
  }
  
  /**
   * Activate stealth mode to hide the app
   */
  public activate(): boolean {
    if (this.isStealthActive) return true;
    
    try {
      console.log('StealthModeManager: Activating stealth mode');
      
      // Change app title to something innocuous
      document.title = 'Weather - Sunny, 25°C';
      
      // Hide app content with overlay
      this.createHiddenOverlay();
      
      // Change favicon to something innocuous
      this.changeFavicon('/favicon-weather.ico');
      
      // Try to lock screen if possible (this requires special permissions)
      this.requestLockScreen();
      
      this.isStealthActive = true;
      this.notifyListeners(true);
      
      return true;
    } catch (error) {
      console.error('StealthModeManager: Error activating stealth mode:', error);
      return false;
    }
  }
  
  /**
   * Deactivate stealth mode and restore the app
   */
  public deactivate(): boolean {
    if (!this.isStealthActive) return true;
    
    try {
      console.log('StealthModeManager: Deactivating stealth mode');
      
      // Restore original title
      document.title = this.originalTitle;
      
      // Remove hidden overlay
      this.removeHiddenOverlay();
      
      // Restore original favicon
      if (this.originalFavicon) {
        this.changeFavicon(this.originalFavicon);
      }
      
      this.isStealthActive = false;
      this.notifyListeners(false);
      
      // Notify user that stealth mode has been deactivated
      toast({
        title: "Security Mode Deactivated",
        description: "Your app is now back to normal operation.",
        duration: 5000,
      });
      
      return true;
    } catch (error) {
      console.error('StealthModeManager: Error deactivating stealth mode:', error);
      return false;
    }
  }
  
  /**
   * Create an overlay that hides the real app content
   */
  private createHiddenOverlay(): void {
    if (this.hiddenDiv) return;
    
    const div = document.createElement('div');
    div.id = 'soteria-stealth-overlay';
    div.style.position = 'fixed';
    div.style.top = '0';
    div.style.left = '0';
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.backgroundColor = '#fff';
    div.style.zIndex = '10000';
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';
    
    // Add decoy content that looks like a weather app
    div.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 2rem; margin-bottom: 1rem;">⛅️ Weather</div>
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">25°C</div>
        <div style="font-size: 1.5rem; margin-bottom: 2rem;">Sunny</div>
        <div style="color: #666; margin-bottom: 1rem;">Today's forecast: Clear skies</div>
        <div style="display: flex; justify-content: center; gap: 2rem;">
          <div style="text-align: center;">
            <div>Mon</div>
            <div>🌤️</div>
            <div>24°C</div>
          </div>
          <div style="text-align: center;">
            <div>Tue</div>
            <div>⛅️</div>
            <div>23°C</div>
          </div>
          <div style="text-align: center;">
            <div>Wed</div>
            <div>🌦️</div>
            <div>22°C</div>
          </div>
        </div>
      </div>
    `;
    
    // Add a hidden button to deactivate stealth mode with a special gesture
    // This would be a complex pattern in a real app to prevent accidental deactivation
    const hiddenButton = document.createElement('div');
    hiddenButton.style.position = 'absolute';
    hiddenButton.style.bottom = '10px';
    hiddenButton.style.right = '10px';
    hiddenButton.style.width = '20px';
    hiddenButton.style.height = '20px';
    hiddenButton.style.opacity = '0';
    
    let tapCount = 0;
    let lastTap = 0;
    
    hiddenButton.addEventListener('click', () => {
      const now = new Date().getTime();
      const timeSince = now - lastTap;
      
      if (timeSince < 300) {
        tapCount++;
        
        if (tapCount >= 5) {
          // 5 rapid taps will deactivate stealth mode
          this.deactivate();
          tapCount = 0;
        }
      } else {
        tapCount = 1;
      }
      
      lastTap = now;
    });
    
    div.appendChild(hiddenButton);
    document.body.appendChild(div);
    this.hiddenDiv = div;
  }
  
  /**
   * Remove the hiding overlay
   */
  private removeHiddenOverlay(): void {
    if (!this.hiddenDiv) return;
    
    document.body.removeChild(this.hiddenDiv);
    this.hiddenDiv = null;
  }
  
  /**
   * Change the favicon to hide app identity
   */
  private changeFavicon(iconPath: string): void {
    let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    
    link.href = iconPath;
  }
  
  /**
   * Request to lock the screen if possible
   * Note: This is a Web API that requires special permissions and may not work in all browsers
   */
  private requestLockScreen(): void {
    // This is a mockup since the actual API would require special permissions
    console.log('StealthModeManager: Requesting screen lock (mock)');
    
    // In a real implementation, you would use something like:
    // navigator.wakeLock.request('screen').then(lock => {...})
  }
  
  /**
   * Add listener for stealth mode status changes
   */
  public addListener(listener: (isActive: boolean) => void): () => void {
    this.listeners.push(listener);
    
    // Immediately notify with current status
    listener(this.isStealthActive);
    
    // Return cleanup function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Notify all listeners of status changes
   */
  private notifyListeners(isActive: boolean): void {
    this.listeners.forEach(listener => {
      try {
        listener(isActive);
      } catch (error) {
        console.error('StealthModeManager: Error notifying listener:', error);
      }
    });
  }
  
  /**
   * Check if stealth mode is active
   */
  public isActive(): boolean {
    return this.isStealthActive;
  }
}
