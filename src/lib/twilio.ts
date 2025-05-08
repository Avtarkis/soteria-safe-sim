
// Mocked Twilio client for development purposes
// In production, this would use the actual Twilio SDK

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

class MockTwilioClient {
  messages = {
    create: async (options: { body: string; to: string; from: string; mediaUrl?: string[] }): Promise<TwilioMessage> => {
      console.log('MOCK TWILIO: Sending SMS', options);
      
      // Simulate API call
      return {
        sid: `mock-${Date.now()}`,
        status: 'sent',
        body: options.body,
        to: options.to,
        from: options.from
      };
    }
  };
  
  calls = {
    create: async (options: { twiml: string; to: string; from: string }): Promise<TwilioCall> => {
      console.log('MOCK TWILIO: Initiating call', options);
      
      // Simulate API call
      return {
        sid: `mock-call-${Date.now()}`,
        status: 'initiated',
        to: options.to,
        from: options.from
      };
    }
  };
}

export const twilioClient = new MockTwilioClient();
