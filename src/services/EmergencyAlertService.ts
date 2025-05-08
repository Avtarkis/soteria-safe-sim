import { supabase } from '@/lib/supabase';
import { twilioClient } from '@/lib/twilio';
import { getDeviceLocation } from '@/utils/location';

interface EmergencyAlertOptions {
  emergency_type: string;
  location: [number, number];
  timestamp: string;
  send_media: boolean;
  recipients: 'all' | 'contacts' | 'medical';
  alert_method: 'sms' | 'mms' | 'phone' | 'all';
}

class EmergencyAlertService {
  private contacts: any[] = []; // Replace 'any' with your contact type
  private user: any = null; // Replace 'any' with your user type

  constructor() {
    this.loadContacts();
    this.loadUser();
  }

  private async loadContacts() {
    // Fetch emergency contacts from Supabase
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*');

      if (error) {
        console.error('Error fetching emergency contacts:', error);
        return;
      }

      this.contacts = data || [];
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
    }
  }

  private async loadUser() {
    // Fetch user data from Supabase
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        return;
      }

      this.user = data || null;
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  public async sendEmergencyAlerts(options: EmergencyAlertOptions): Promise<void> {
    console.log('Sending emergency alerts with options:', options);

    // Get user's current location
    const location = await getDeviceLocation();
    const latitude = location?.coords.latitude || 0;
    const longitude = location?.coords.longitude || 0;

    // Construct message content
    let messageContent = `EMERGENCY ALERT: ${options.emergency_type}\n`;
    messageContent += `Location: Latitude ${latitude}, Longitude ${longitude}\n`;
    messageContent += `Timestamp: ${options.timestamp}`;

    // Determine recipients based on options
    let recipients: any[] = []; // Replace 'any' with your contact type
    if (options.recipients === 'all' || options.recipients === 'contacts') {
      recipients = this.contacts;
    } else if (options.recipients === 'medical') {
      // Add logic to fetch medical contacts if needed
      recipients = []; // Replace with actual medical contacts
    }

    // Determine alert method
    const method = options.alert_method;

    // Send messages to each recipient
    for (const recipient of recipients) {
      try {
        let sent = false;

        // Try native SMS
        if (method === 'sms' || method === 'mms' || method === 'all') {
          sent = await this.sendMessageViaNativeSMS(recipient, messageContent);
        }
        
        // Try Twilio if native SMS fails or isn't available
        if (!sent && (method === 'sms' || method === 'mms')) {
          sent = await this.sendMessageViaTwilio(recipient, messageContent, {
            includeMedia: method === 'mms',
            emergencyType: options.emergency_type
          });
        }

        // Try phone call
        if (!sent && (method === 'phone' || method === 'all')) {
          // Implement phone call logic here
          console.log(`Making phone call to ${recipient.phone}`);
          // sent = await this.makeEmergencyCall(recipient, options.emergency_type);
        }

        if (sent) {
          console.log(`Emergency alert sent to ${recipient.name} via ${method}`);
        } else {
          console.warn(`Failed to send emergency alert to ${recipient.name}`);
        }
      } catch (error) {
        console.error(`Error sending emergency alert to ${recipient.name}:`, error);
      }
    }
  }

  private async sendMessageViaNativeSMS(recipient: any, message: string): Promise<boolean> {
    // Implement native SMS sending logic here
    // This is highly platform-dependent and may not be possible in a web environment
    console.log(`Sending native SMS to ${recipient.phone}: ${message}`);
    return false; // Indicate failure as it's not implemented
  }

  private async sendMessageViaTwilio(recipient: any, message: string, options: { includeMedia: boolean; emergencyType: string }): Promise<boolean> {
    try {
      // Send SMS via Twilio
      const twilioMessage = await twilioClient.messages.create({
        body: message,
        to: recipient.phone,
        from: process.env.TWILIO_PHONE_NUMBER,
        // mediaUrl: options.includeMedia ? [this.getMediaUrl(options.emergencyType)] : [], // Implement media URL logic
      });

      console.log(`SMS sent via Twilio to ${recipient.phone}: ${twilioMessage.sid}`);
      return true;
    } catch (error) {
      console.error(`Error sending SMS via Twilio to ${recipient.phone}:`, error);
      return false;
    }
  }

  public async sendAllClearAlert(): Promise<void> {
    // Send "all clear" notification to contacts
    const message = 'ALL CLEAR: The emergency situation has been resolved.';

    for (const contact of this.contacts) {
      try {
        // Send SMS via Twilio
        const twilioMessage = await twilioClient.messages.create({
          body: message,
          to: contact.phone,
          from: process.env.TWILIO_PHONE_NUMBER,
        });

        console.log(`"All clear" SMS sent via Twilio to ${contact.phone}: ${twilioMessage.sid}`);
      } catch (error) {
        console.error(`Error sending "all clear" SMS via Twilio to ${contact.phone}:`, error);
      }
    }
  }

  private getMediaUrl(emergencyType: string): string {
    // Implement logic to determine media URL based on emergency type
    // This could be a static image or a dynamically generated video
    return 'https://example.com/emergency_media.jpg'; // Replace with actual URL
  }

  private async makeEmergencyCall(recipient: any, emergencyType: string): Promise<boolean> {
    try {
      // Make phone call via Twilio
      const call = await twilioClient.calls.create({
        twiml: `<Response><Say>Emergency! ${emergencyType}. Help is on the way.</Say></Response>`,
        to: recipient.phone,
        from: process.env.TWILIO_PHONE_NUMBER,
      });

      console.log(`Emergency call initiated to ${recipient.phone}: ${call.sid}`);
      return true;
    } catch (error) {
      console.error(`Error initiating emergency call to ${recipient.phone}:`, error);
      return false;
    }
  }
}

export const emergencyAlertService = new EmergencyAlertService();
export default emergencyAlertService;
