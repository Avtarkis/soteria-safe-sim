
export interface EmergencyService {
  id: string;
  name: string;
  type: 'police' | 'fire' | 'medical' | 'general';
  phoneNumber: string;
  address?: string;
  coordinates?: [number, number];
  distance?: number; // Distance in meters from user's location
  response_time?: number; // Estimated response time in minutes
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  isPrimary: boolean;
}
