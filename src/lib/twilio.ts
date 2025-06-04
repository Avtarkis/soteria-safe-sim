
import { toast } from '@/hooks/use-toast';

interface TwilioMessage {
  sid: string;
  status: string;
  body: string;
  to: string;
  from: string;
}

interface TwilioCall {
  sid: string;
  status: string;
  to: string;
  from: string;
}

class TwilioClient {
  private accountSid: string | null = null;
  private authToken: string | null = null;
  private fromNumber: string | null = null;

  constructor() {
    // In production, these would come from environment variables or user settings
    this.accountSid = localStorage.getItem('twilio_account_sid');
    this.authToken = localStorage.getItem('twilio_auth_token');
    this.fromNumber = localStorage.getItem('twilio_from_number');
  }

  public configure(accountSid: string, authToken: string, fromNumber: string): void {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromNumber = fromNumber;
    
    // Store securely (in production, use proper secret management)
    localStorage.setItem('twilio_account_sid', accountSid);
    localStorage.setItem('twilio_auth_token', authToken);
    localStorage.setItem('twilio_from_number', fromNumber);
  }

  public isConfigured(): boolean {
    return !!(this.accountSid && this.authToken && this.fromNumber);
  }

  messages = {
    create: async (options: { body: string; to: string; from?: string; mediaUrl?: string[] }): Promise<TwilioMessage> => {
      if (!this.isConfigured()) {
        console.log('TWILIO NOT CONFIGURED: Would send SMS', options);
        
        // Fallback to browser SMS capability
        const smsUrl = `sms:${options.to}?body=${encodeURIComponent(options.body)}`;
        window.open(smsUrl);
        
        return {
          sid: `fallback-${Date.now()}`,
          status: 'sent',
          body: options.body,
          to: options.to,
          from: options.from || this.fromNumber || 'emergency'
        };
      }

      try {
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${this.accountSid}:${this.authToken}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            Body: options.body,
            To: options.to,
            From: options.from || this.fromNumber!,
            ...(options.mediaUrl && { MediaUrl: options.mediaUrl.join(',') })
          }),
        });

        if (!response.ok) {
          throw new Error(`Twilio API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('SMS sent via Twilio:', data);
        
        return {
          sid: data.sid,
          status: data.status,
          body: data.body,
          to: data.to,
          from: data.from
        };
      } catch (error) {
        console.error('Twilio SMS error:', error);
        
        // Fallback to browser SMS
        const smsUrl = `sms:${options.to}?body=${encodeURIComponent(options.body)}`;
        window.open(smsUrl);
        
        toast({
          title: "SMS Fallback",
          description: "Using device SMS app as fallback",
        });
        
        return {
          sid: `fallback-${Date.now()}`,
          status: 'sent',
          body: options.body,
          to: options.to,
          from: options.from || 'emergency'
        };
      }
    }
  };
  
  calls = {
    create: async (options: { twiml: string; to: string; from?: string }): Promise<TwilioCall> => {
      if (!this.isConfigured()) {
        console.log('TWILIO NOT CONFIGURED: Would make call', options);
        
        // Fallback to browser tel: protocol
        const telUrl = `tel:${options.to}`;
        window.open(telUrl, '_self');
        
        return {
          sid: `fallback-call-${Date.now()}`,
          status: 'initiated',
          to: options.to,
          from: options.from || this.fromNumber || 'emergency'
        };
      }

      try {
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Calls.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${this.accountSid}:${this.authToken}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            Twiml: options.twiml,
            To: options.to,
            From: options.from || this.fromNumber!,
          }),
        });

        if (!response.ok) {
          throw new Error(`Twilio API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Call initiated via Twilio:', data);
        
        return {
          sid: data.sid,
          status: data.status,
          to: data.to,
          from: data.from
        };
      } catch (error) {
        console.error('Twilio call error:', error);
        
        // Fallback to browser tel: protocol
        const telUrl = `tel:${options.to}`;
        window.open(telUrl, '_self');
        
        toast({
          title: "Call Fallback",
          description: "Using device phone app as fallback",
        });
        
        return {
          sid: `fallback-call-${Date.now()}`,
          status: 'initiated',
          to: options.to,
          from: options.from || 'emergency'
        };
      }
    }
  };
}

export const twilioClient = new TwilioClient();
