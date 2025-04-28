
export interface FamilyMember {
  id: string;
  name: string;
  type: 'child' | 'adult' | 'senior';
  location: {
    name: string;
    type: 'home' | 'school' | 'work' | 'other';
    coordinates: [number, number];
    lastUpdated: string;
  };
  status: 'online' | 'offline' | 'emergency';
  lastCheckIn: string;
  batteryLevel: number;
  safeZones: {
    id: string;
    name: string;
    type: 'home' | 'school' | 'work' | 'other';
    status: 'inside' | 'outside';
  }[];
  healthStatus?: {
    status: 'normal' | 'warning' | 'critical';
    description?: string;
  };
}
