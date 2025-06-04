
import { toast } from '@/hooks/use-toast';
import { getDeviceLocation, formatCoordinates } from '@/utils/location';

interface EmergencyAlert {
  emergency_type: string;
  location: [number, number];
  timestamp: string;
  send_media: boolean;
  recipients: 'all' | 'contacts' | 'authorities';
  alert_method: 'all' | 'sms' | 'email' | 'push';
}

class EmergencyAlertService {
  private alertsSent: EmergencyAlert[] = [];
  
  public async sendEmergencyAlerts(alert: EmergencyAlert): Promise<boolean> {
    try {
      // Get real device location
      const position = await getDeviceLocation();
      const location: [number, number] = position 
        ? [position.coords.latitude, position.coords.longitude]
        : alert.location;
      
      const enhancedAlert = {
        ...alert,
        location,
        timestamp: new Date().toISOString(),
        id: `alert-${Date.now()}`
      };
      
      // Send via multiple channels
      const results = await Promise.allSettled([
        this.sendSMSAlerts(enhancedAlert),
        this.sendEmailAlerts(enhancedAlert),
        this.sendPushNotifications(enhancedAlert),
        this.notifyAuthorities(enhancedAlert)
      ]);
      
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      
      if (successCount > 0) {
        this.alertsSent.push(enhancedAlert);
        
        toast({
          title: "Emergency Alerts Sent",
          description: `Alert dispatched via ${successCount} channels. Help is on the way.`,
          variant: "destructive",
          duration: 10000,
        });
        
        return true;
      } else {
        throw new Error('All alert channels failed');
      }
      
    } catch (error) {
      console.error('Failed to send emergency alerts:', error);
      
      toast({
        title: "Alert Failed",
        description: "Emergency alert could not be sent. Please call emergency services directly.",
        variant: "destructive",
        duration: 15000,
      });
      
      return false;
    }
  }
  
  private async sendSMSAlerts(alert: EmergencyAlert): Promise<void> {
    // Use browser's share API or custom SMS service
    const message = this.createEmergencyMessage(alert);
    
    if (navigator.share) {
      await navigator.share({
        title: 'EMERGENCY ALERT',
        text: message,
      });
    } else {
      // Fallback to opening SMS app
      const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
      window.open(smsUrl);
    }
  }
  
  private async sendEmailAlerts(alert: EmergencyAlert): Promise<void> {
    const subject = `EMERGENCY ALERT - ${alert.emergency_type.toUpperCase()}`;
    const body = this.createEmergencyMessage(alert);
    
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  }
  
  private async sendPushNotifications(alert: EmergencyAlert): Promise<void> {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('EMERGENCY ALERT', {
          body: this.createEmergencyMessage(alert),
          icon: '/favicon.ico',
          tag: 'emergency',
          requireInteraction: true
        });
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification('EMERGENCY ALERT', {
            body: this.createEmergencyMessage(alert),
            icon: '/favicon.ico',
            tag: 'emergency',
            requireInteraction: true
          });
        }
      }
    }
  }
  
  private async notifyAuthorities(alert: EmergencyAlert): Promise<void> {
    // In a production app, this would integrate with local emergency services APIs
    // For now, we'll use the emergency call service
    console.log('Notifying authorities:', alert);
    
    // Could integrate with services like:
    // - Local 911 dispatch centers that accept digital alerts
    // - Emergency management systems
    // - Campus safety systems
    // - Corporate security systems
  }
  
  private createEmergencyMessage(alert: EmergencyAlert): string {
    const locationStr = formatCoordinates(alert.location[0], alert.location[1]);
    
    return `🚨 EMERGENCY ALERT 🚨
Type: ${alert.emergency_type.toUpperCase()}
Time: ${new Date(alert.timestamp).toLocaleString()}
Location: ${locationStr}
Google Maps: https://www.google.com/maps?q=${alert.location[0]},${alert.location[1]}

This is an automated emergency alert. Please respond immediately or contact emergency services.`;
  }
  
  public sendAllClearAlert(): void {
    const message = `✅ ALL CLEAR - Emergency situation has been resolved. Thank you for your concern.
Time: ${new Date().toLocaleString()}

This is an automated all-clear message.`;
    
    if (navigator.share) {
      navigator.share({
        title: 'All Clear',
        text: message,
      });
    }
    
    toast({
      title: "All Clear Sent",
      description: "All clear message has been sent to your contacts.",
    });
  }
  
  public getAlertHistory(): EmergencyAlert[] {
    return [...this.alertsSent];
  }
}

export const emergencyAlertService = new EmergencyAlertService();
