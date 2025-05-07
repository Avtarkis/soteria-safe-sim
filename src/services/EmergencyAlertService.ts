
import { toast } from '@/hooks/use-toast';

// Types for alert options
export interface EmergencyAlertOptions {
  emergency_type: string;
  location: [number, number];
  timestamp: string;
  send_media: boolean;
  recipients: 'all' | 'medical' | 'police' | 'contacts';
  alert_method: 'all' | 'sms' | 'mms' | 'twilio';
  custom_message?: string;
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  notify_in_emergency: boolean;
}

export class EmergencyAlertService {
  private twilioAccountSid = 'AC0064fa770de1097832f2ac3157663409';
  private twilioAuthToken = '37c2d36982a8f36e280dff970f0112a5';
  private twilioPhoneNumber = '+15084634409';
  private devicePhoneNumber: string | null = null;
  private emergencyContacts: EmergencyContact[] = [];
  private lastAlertTimestamp = 0;
  private minTimeBetweenAlerts = 60000; // 1 minute
  private currentLocation: [number, number] | null = null;
  
  constructor() {
    // Load emergency contacts
    this.loadEmergencyContacts();
    
    // Check Twilio configuration
    if (!this.twilioAccountSid || !this.twilioAuthToken || !this.twilioPhoneNumber) {
      console.warn('EmergencyAlertService: Twilio credentials not fully configured');
    }
    
    // Try to get device location
    this.getCurrentLocation();
    
    console.log('EmergencyAlertService: Initialized');
  }
  
  /**
   * Load emergency contacts from storage
   */
  private loadEmergencyContacts(): void {
    try {
      // In a real app, this would load from secure storage or API
      // For demo, we'll use hardcoded contacts
      this.emergencyContacts = [
        {
          name: 'John Smith',
          relationship: 'Brother',
          phoneNumber: '+1234567890',
          notify_in_emergency: true
        },
        {
          name: 'Emergency Services',
          relationship: 'Public Service',
          phoneNumber: '911',
          notify_in_emergency: true
        }
      ];
    } catch (error) {
      console.error('EmergencyAlertService: Error loading contacts:', error);
      this.emergencyContacts = [];
    }
  }
  
  /**
   * Get current device location
   */
  private getCurrentLocation(): void {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentLocation = [position.coords.latitude, position.coords.longitude];
          console.log('EmergencyAlertService: Got location:', this.currentLocation);
        },
        (error) => {
          console.error('EmergencyAlertService: Error getting location:', error);
        }
      );
    }
  }
  
  /**
   * Send emergency alerts to configured contacts
   */
  public async sendEmergencyAlerts(options: EmergencyAlertOptions): Promise<boolean> {
    // Prevent sending multiple alerts too quickly
    const now = Date.now();
    if (now - this.lastAlertTimestamp < this.minTimeBetweenAlerts) {
      console.log('EmergencyAlertService: Alert throttled, too soon since last alert');
      return false;
    }
    
    this.lastAlertTimestamp = now;
    console.log('EmergencyAlertService: Sending emergency alerts with options:', options);
    
    // Use provided location or current location
    const location = this.currentLocation || options.location;
    const locationUrl = `https://www.google.com/maps?q=${location[0]},${location[1]}`;
    
    // Build the alert message
    let message = this.buildAlertMessage(options.emergency_type, locationUrl, options.custom_message);
    
    // Determine recipients based on emergency type
    const recipients = this.getRecipientsForEmergency(options.recipients);
    
    if (recipients.length === 0) {
      console.warn('EmergencyAlertService: No recipients found for alert');
      return false;
    }
    
    let successCount = 0;
    
    // First try native SMS/MMS
    if (options.alert_method === 'all' || options.alert_method === 'sms' || options.alert_method === 'mms') {
      const nativeSuccess = await this.sendNativeSMS(recipients, message, options.send_media);
      
      if (nativeSuccess) {
        successCount += recipients.length;
        console.log('EmergencyAlertService: Successfully sent native SMS/MMS');
      } else {
        console.log('EmergencyAlertService: Native SMS/MMS failed, trying Twilio');
        
        // Fallback to Twilio if native SMS fails
        if (options.alert_method === 'all' || options.alert_method === 'twilio') {
          const twilioSuccess = await this.sendTwilioMessages(recipients, message, options.send_media);
          if (twilioSuccess) {
            successCount += recipients.length;
            console.log('EmergencyAlertService: Successfully sent Twilio messages');
          }
        }
      }
    } else if (options.alert_method === 'twilio') {
      // Directly use Twilio
      const twilioSuccess = await this.sendTwilioMessages(recipients, message, options.send_media);
      if (twilioSuccess) {
        successCount += recipients.length;
        console.log('EmergencyAlertService: Successfully sent Twilio messages');
      }
    }
    
    // Show result toast
    if (successCount > 0) {
      toast({
        title: "Emergency Alerts Sent",
        description: `Successfully sent alerts to ${successCount} contacts.`,
        duration: 5000,
      });
      return true;
    } else {
      toast({
        title: "Alert Sending Failed",
        description: "Could not send emergency alerts. Please try manually.",
        variant: "destructive",
        duration: 10000,
      });
      return false;
    }
  }
  
  /**
   * Send an all-clear alert to contacts
   */
  public async sendAllClearAlert(): Promise<boolean> {
    console.log('EmergencyAlertService: Sending all-clear alert');
    
    const message = "I'm safe now. The emergency situation has been resolved.";
    const recipients = this.emergencyContacts.filter(contact => contact.notify_in_emergency);
    
    if (recipients.length === 0) {
      return false;
    }
    
    // Try both native and Twilio methods
    const nativeSuccess = await this.sendNativeSMS(recipients, message, false);
    
    if (nativeSuccess) {
      toast({
        title: "All-Clear Alert Sent",
        description: "Your contacts have been notified that you're safe.",
        duration: 5000,
      });
      return true;
    }
    
    // Fallback to Twilio
    const twilioSuccess = await this.sendTwilioMessages(recipients, message, false);
    
    if (twilioSuccess) {
      toast({
        title: "All-Clear Alert Sent",
        description: "Your contacts have been notified that you're safe.",
        duration: 5000,
      });
      return true;
    }
    
    toast({
      title: "All-Clear Alert Failed",
      description: "Could not send all-clear messages. Please contact your emergency contacts manually.",
      variant: "destructive",
      duration: 10000,
    });
    return false;
  }
  
  /**
   * Send SMS/MMS using native device capabilities
   */
  private async sendNativeSMS(
    recipients: EmergencyContact[], 
    message: string,
    includeMedia: boolean
  ): Promise<boolean> {
    console.log('EmergencyAlertService: [MOCK] Sending native SMS to', 
      recipients.map(r => r.name).join(', '));
    
    // In a real implementation, this would use Capacitor or other native bridge
    // For demo purposes, we'll simulate it
    
    try {
      // Simulate sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (Math.random() > 0.3) { // 70% success rate for demo
        return true;
      } else {
        throw new Error('Simulated native SMS failure');
      }
    } catch (error) {
      console.error('EmergencyAlertService: Error sending native SMS:', error);
      return false;
    }
  }
  
  /**
   * Send messages using Twilio API
   */
  private async sendTwilioMessages(
    recipients: EmergencyContact[], 
    message: string,
    includeMedia: boolean
  ): Promise<boolean> {
    console.log('EmergencyAlertService: [MOCK] Sending Twilio messages to', 
      recipients.map(r => r.name).join(', '));
    
    if (!this.twilioAccountSid || !this.twilioAuthToken || !this.twilioPhoneNumber) {
      console.error('EmergencyAlertService: Twilio credentials not configured');
      return false;
    }
    
    try {
      // In a real implementation, this would make API calls to Twilio
      // For demo purposes, we'll simulate it
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (Math.random() > 0.2) { // 80% success rate for demo
        return true;
      } else {
        throw new Error('Simulated Twilio API failure');
      }
    } catch (error) {
      console.error('EmergencyAlertService: Error sending Twilio messages:', error);
      return false;
    }
  }
  
  /**
   * Get appropriate recipients based on emergency type
   */
  private getRecipientsForEmergency(recipientType: string): EmergencyContact[] {
    switch (recipientType) {
      case 'all':
        return this.emergencyContacts.filter(contact => contact.notify_in_emergency);
      
      case 'medical':
        return this.emergencyContacts.filter(contact => 
          contact.relationship === 'Medical' || 
          contact.relationship === 'Public Service' ||
          contact.notify_in_emergency
        );
      
      case 'police':
        return this.emergencyContacts.filter(contact => 
          contact.relationship === 'Public Service' || 
          contact.notify_in_emergency
        );
      
      case 'contacts':
      default:
        return this.emergencyContacts.filter(contact => 
          contact.relationship !== 'Public Service' && 
          contact.notify_in_emergency
        );
    }
  }
  
  /**
   * Build the alert message based on emergency type
   */
  private buildAlertMessage(
    emergencyType: string, 
    locationUrl: string,
    customMessage?: string
  ): string {
    if (customMessage) {
      return `${customMessage} My location: ${locationUrl}`;
    }
    
    switch (emergencyType) {
      case 'violent_attack':
        return `SOS! I'm in danger and need immediate help! My location: ${locationUrl}. Please call police - this is a violent emergency!`;
      
      case 'kidnapping':
        return `EMERGENCY! I may be getting kidnapped. My location: ${locationUrl}. Please call police immediately!`;
      
      case 'weapon':
        return `SOS! Weapon threat detected! My location: ${locationUrl}. Please call police immediately!`;
      
      case 'medical':
        return `MEDICAL EMERGENCY! I need medical assistance. My location: ${locationUrl}. Please help!`;
      
      default:
        return `SOS! Emergency situation! I need help. My location: ${locationUrl}`;
    }
  }
  
  /**
   * Add a new emergency contact
   */
  public addEmergencyContact(contact: EmergencyContact): void {
    this.emergencyContacts.push(contact);
    // In a real app, you would save this to storage or API
    console.log('EmergencyAlertService: Added new emergency contact:', contact.name);
  }
  
  /**
   * Get all emergency contacts
   */
  public getEmergencyContacts(): EmergencyContact[] {
    return [...this.emergencyContacts];
  }
  
  /**
   * Set device phone number
   */
  public setDevicePhoneNumber(phoneNumber: string): void {
    this.devicePhoneNumber = phoneNumber;
  }
}
