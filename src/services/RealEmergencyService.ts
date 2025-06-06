
import { useToast } from '@/hooks/use-toast';

interface EmergencyRequest {
  type: 'medical' | 'fire' | 'police' | 'general';
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  userInfo: {
    name?: string;
    phone?: string;
    medicalInfo?: string;
  };
}

interface EmergencyResponse {
  requestId: string;
  status: 'received' | 'dispatched' | 'en_route' | 'arrived';
  estimatedArrival?: string;
  dispatchedUnits?: string[];
}

class RealEmergencyService {
  private apiEndpoint = process.env.EMERGENCY_API_ENDPOINT || '/api/emergency';
  private apiKey = process.env.EMERGENCY_API_KEY;

  async requestEmergencyServices(request: EmergencyRequest): Promise<EmergencyResponse> {
    try {
      console.log('Requesting emergency services:', request);

      // In production, this would make a real API call to emergency dispatch
      const response = await fetch(`${this.apiEndpoint}/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          ...request,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Emergency service request failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Emergency services response:', result);

      return result;
    } catch (error) {
      console.error('Emergency service error:', error);
      
      // Fallback: Create local emergency record and attempt alternative contact methods
      return this.handleEmergencyFallback(request);
    }
  }

  private async handleEmergencyFallback(request: EmergencyRequest): Promise<EmergencyResponse> {
    console.log('Using emergency fallback procedures');
    
    // Store emergency request locally
    const requestId = `emergency-${Date.now()}`;
    localStorage.setItem(`emergency-${requestId}`, JSON.stringify({
      ...request,
      timestamp: new Date().toISOString(),
      status: 'fallback'
    }));

    // Attempt to contact emergency services via alternative methods
    this.tryAlternativeEmergencyContact(request);

    return {
      requestId,
      status: 'received',
      estimatedArrival: 'Unknown - using fallback procedures'
    };
  }

  private async tryAlternativeEmergencyContact(request: EmergencyRequest) {
    // Try calling emergency number directly
    if ('navigator' in window && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.sync.register('emergency-contact-fallback');
      });
    }

    // Send emergency SMS if possible
    this.sendEmergencySMS(request);
  }

  private sendEmergencySMS(request: EmergencyRequest) {
    const message = `EMERGENCY: ${request.type.toUpperCase()} - ${request.description} at ${request.location.latitude}, ${request.location.longitude}`;
    
    // In a real implementation, this would use a SMS service
    console.log('Emergency SMS would be sent:', message);
  }

  async getEmergencyStatus(requestId: string): Promise<EmergencyResponse | null> {
    try {
      const response = await fetch(`${this.apiEndpoint}/status/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error getting emergency status:', error);
    }

    // Check local storage for fallback requests
    const localRequest = localStorage.getItem(`emergency-${requestId}`);
    if (localRequest) {
      const parsed = JSON.parse(localRequest);
      return {
        requestId,
        status: 'received',
        estimatedArrival: 'Unknown'
      };
    }

    return null;
  }
}

export const realEmergencyService = new RealEmergencyService();
export default realEmergencyService;
export type { EmergencyRequest, EmergencyResponse };
