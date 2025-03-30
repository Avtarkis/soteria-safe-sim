
export interface ThreatMarker {
  id: string;
  position: [number, number]; // [latitude, longitude]
  level: 'low' | 'medium' | 'high';
  title: string;
  details: string;
  type?: 'cyber' | 'physical' | 'environmental'; // Add type to categorize threats
}

// Global threat data interfaces
export interface GlobalThreatData {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  level: 'low' | 'medium' | 'high';
  type: 'cyber' | 'physical' | 'environmental';
  source: string;
  timestamp: string;
}

// Emergency response interfaces
export interface EmergencyFeatures {
  sirenActive: boolean;
  recordingMode: 'off' | 'video' | 'audio' | 'photo';
  alertSent: boolean;
  policeNotified: boolean;
}

export interface EmergencyNeighbor {
  id: string;
  distance: number; // in meters
  notified: boolean;
}
