
interface EmergencyServiceProvider {
  name: string;
  type: 'police' | 'fire' | 'medical' | 'general';
  phoneNumber: string;
  apiEndpoint?: string;
  apiKey?: string;
  jurisdiction: string;
  coordinates: [number, number];
  responseTimeMinutes: number;
}

interface EmergencyRequest {
  type: 'medical' | 'fire' | 'police' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    accuracy?: number;
  };
  description: string;
  userInfo: {
    name?: string;
    phone?: string;
    medicalConditions?: string[];
    emergencyContacts?: Array<{
      name: string;
      phone: string;
      relationship: string;
    }>;
  };
  mediaAttachments?: {
    photos: Blob[];
    videos: Blob[];
    audio: Blob[];
  };
}

interface EmergencyResponse {
  requestId: string;
  status: 'received' | 'dispatched' | 'en_route' | 'on_scene' | 'resolved';
  dispatchedUnits: Array<{
    unitId: string;
    type: string;
    estimatedArrival: string;
    currentLocation?: [number, number];
  }>;
  responseTime?: number;
  incidentNumber?: string;
  dispatchCenter: string;
}

class RealEmergencyServiceIntegration {
  private serviceProviders: Map<string, EmergencyServiceProvider> = new Map();
  private activeRequests: Map<string, EmergencyRequest> = new Map();
  private emergencyAPIs: Map<string, string> = new Map();

  constructor() {
    this.initializeServiceProviders();
    this.loadEmergencyAPIs();
  }

  private initializeServiceProviders(): void {
    // Load service providers from database or configuration
    const providers: EmergencyServiceProvider[] = [
      {
        name: 'Local Police Department',
        type: 'police',
        phoneNumber: '911',
        jurisdiction: 'local',
        coordinates: [0, 0], // Will be updated based on location
        responseTimeMinutes: 8
      },
      {
        name: 'Fire Department',
        type: 'fire',
        phoneNumber: '911',
        jurisdiction: 'local',
        coordinates: [0, 0],
        responseTimeMinutes: 6
      },
      {
        name: 'Emergency Medical Services',
        type: 'medical',
        phoneNumber: '911',
        jurisdiction: 'local',
        coordinates: [0, 0],
        responseTimeMinutes: 10
      }
    ];

    providers.forEach(provider => {
      this.serviceProviders.set(`${provider.type}_${provider.jurisdiction}`, provider);
    });
  }

  private loadEmergencyAPIs(): void {
    // Load emergency service API endpoints
    this.emergencyAPIs.set('police', process.env.POLICE_API_ENDPOINT || '');
    this.emergencyAPIs.set('fire', process.env.FIRE_API_ENDPOINT || '');
    this.emergencyAPIs.set('medical', process.env.MEDICAL_API_ENDPOINT || '');
    this.emergencyAPIs.set('dispatch', process.env.DISPATCH_API_ENDPOINT || '');
  }

  async requestEmergencyServices(request: EmergencyRequest): Promise<EmergencyResponse> {
    try {
      console.log('Requesting emergency services:', request);

      // Generate unique request ID
      const requestId = `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.activeRequests.set(requestId, request);

      // Determine appropriate service provider
      const provider = await this.findNearestServiceProvider(request.type, request.location);
      
      if (!provider) {
        throw new Error('No emergency service provider available');
      }

      // Primary method: Digital emergency dispatch
      let response = await this.submitDigitalEmergencyRequest(requestId, request, provider);
      
      if (!response) {
        // Fallback: Traditional phone call
        response = await this.initiateEmergencyCall(requestId, request, provider);
      }

      // Store the request for tracking
      await this.storeEmergencyRequest(requestId, request, response);

      // Start real-time tracking
      this.startEmergencyTracking(requestId);

      return response;

    } catch (error) {
      console.error('Emergency service request failed:', error);
      
      // Critical fallback: Direct emergency number dial
      return await this.emergencyFallback(request);
    }
  }

  private async findNearestServiceProvider(
    type: string,
    location: { latitude: number; longitude: number }
  ): Promise<EmergencyServiceProvider | null> {
    try {
      // Query emergency services database by location
      const response = await fetch('/api/emergency/find-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, location })
      });

      if (response.ok) {
        const data = await response.json();
        return data.provider;
      }
    } catch (error) {
      console.error('Error finding service provider:', error);
    }

    // Fallback to default provider
    return this.serviceProviders.get(`${type}_local`) || null;
  }

  private async submitDigitalEmergencyRequest(
    requestId: string,
    request: EmergencyRequest,
    provider: EmergencyServiceProvider
  ): Promise<EmergencyResponse | null> {
    try {
      if (!provider.apiEndpoint || !provider.apiKey) {
        return null; // No digital API available
      }

      const response = await fetch(provider.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.apiKey}`,
          'X-Emergency-Priority': request.priority
        },
        body: JSON.stringify({
          requestId,
          type: request.type,
          priority: request.priority,
          location: request.location,
          description: request.description,
          caller: request.userInfo,
          timestamp: new Date().toISOString(),
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          requestId,
          status: 'received',
          dispatchedUnits: data.units || [],
          incidentNumber: data.incidentNumber,
          dispatchCenter: provider.name
        };
      }
    } catch (error) {
      console.error('Digital emergency request failed:', error);
    }

    return null;
  }

  private async initiateEmergencyCall(
    requestId: string,
    request: EmergencyRequest,
    provider: EmergencyServiceProvider
  ): Promise<EmergencyResponse> {
    try {
      // Attempt to initiate phone call
      if ('navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]); // Emergency vibration pattern
      }

      // For web browsers, open tel: link
      const phoneUrl = `tel:${provider.phoneNumber}`;
      window.open(phoneUrl, '_self');

      // Log the emergency call attempt
      await fetch('/api/emergency/log-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          provider: provider.name,
          phoneNumber: provider.phoneNumber,
          request: request,
          timestamp: new Date().toISOString()
        })
      });

      return {
        requestId,
        status: 'received',
        dispatchedUnits: [],
        dispatchCenter: provider.name,
        responseTime: provider.responseTimeMinutes
      };
    } catch (error) {
      console.error('Emergency call initiation failed:', error);
      throw error;
    }
  }

  private async emergencyFallback(request: EmergencyRequest): Promise<EmergencyResponse> {
    console.log('Using emergency fallback procedures');
    
    const requestId = `fallback_${Date.now()}`;
    
    try {
      // Attempt to call 911 directly
      window.open('tel:911', '_self');
      
      // Send emergency SMS if possible
      await this.sendEmergencySMS(request);
      
      // Store locally for later sync
      localStorage.setItem(`emergency_${requestId}`, JSON.stringify({
        ...request,
        timestamp: new Date().toISOString(),
        status: 'fallback'
      }));

      return {
        requestId,
        status: 'received',
        dispatchedUnits: [],
        dispatchCenter: 'Emergency Fallback',
        responseTime: 15 // Estimated fallback response time
      };
    } catch (error) {
      console.error('Emergency fallback failed:', error);
      throw new Error('All emergency contact methods failed');
    }
  }

  private async sendEmergencySMS(request: EmergencyRequest): Promise<void> {
    try {
      const message = `🚨 EMERGENCY 🚨\nType: ${request.type.toUpperCase()}\nLocation: ${request.location.latitude}, ${request.location.longitude}\nDescription: ${request.description}\n\nThis is an automated emergency alert.`;
      
      // Use SMS API service
      await fetch('/api/emergency/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: '+1911', // Emergency SMS gateway
          message: message,
          priority: 'emergency'
        })
      });
    } catch (error) {
      console.error('Emergency SMS failed:', error);
    }
  }

  private async storeEmergencyRequest(
    requestId: string,
    request: EmergencyRequest,
    response: EmergencyResponse
  ): Promise<void> {
    try {
      await fetch('/api/emergency/store-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          request,
          response,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error storing emergency request:', error);
    }
  }

  private startEmergencyTracking(requestId: string): void {
    // Start real-time tracking of emergency response
    const trackingInterval = setInterval(async () => {
      try {
        const status = await this.getEmergencyStatus(requestId);
        if (status && (status.status === 'resolved' || status.status === 'on_scene')) {
          clearInterval(trackingInterval);
        }
        
        // Notify user of status updates
        document.dispatchEvent(new CustomEvent('emergencyStatusUpdate', {
          detail: { requestId, status }
        }));
      } catch (error) {
        console.error('Error tracking emergency:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  async getEmergencyStatus(requestId: string): Promise<EmergencyResponse | null> {
    try {
      const response = await fetch(`/api/emergency/status/${requestId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error getting emergency status:', error);
    }

    // Check local storage for fallback requests
    const localRequest = localStorage.getItem(`emergency_${requestId}`);
    if (localRequest) {
      const parsed = JSON.parse(localRequest);
      return {
        requestId,
        status: 'received',
        dispatchedUnits: [],
        dispatchCenter: 'Local Storage'
      };
    }

    return null;
  }

  async cancelEmergencyRequest(requestId: string, reason: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/emergency/cancel/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, timestamp: new Date().toISOString() })
      });

      if (response.ok) {
        this.activeRequests.delete(requestId);
        return true;
      }
    } catch (error) {
      console.error('Error canceling emergency request:', error);
    }
    return false;
  }

  getActiveRequests(): EmergencyRequest[] {
    return Array.from(this.activeRequests.values());
  }

  addServiceProvider(provider: EmergencyServiceProvider): void {
    this.serviceProviders.set(`${provider.type}_${provider.jurisdiction}`, provider);
  }

  updateServiceProvider(key: string, updates: Partial<EmergencyServiceProvider>): void {
    const provider = this.serviceProviders.get(key);
    if (provider) {
      Object.assign(provider, updates);
    }
  }
}

export const realEmergencyService = new RealEmergencyServiceIntegration();
export default realEmergencyService;
export type { EmergencyServiceProvider, EmergencyRequest, EmergencyResponse };
