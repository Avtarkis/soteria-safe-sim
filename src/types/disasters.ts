
// Disaster Alerts Types
export type DisasterAlertType = 'earthquake' | 'wildfire' | 'flood' | 'storm' | 'extreme_heat';
export type DisasterAlertSeverity = 'advisory' | 'watch' | 'warning';

export interface DisasterAlert {
  id: string;
  title: string;
  type: DisasterAlertType;
  severity: DisasterAlertSeverity;
  location: string;
  coordinates: [number, number];
  description: string;
  date: string;
  source: string;
  active: boolean;
  country: string;
  region: string;
  url?: string;
}

export interface WeatherAlert {
  id: string;
  title: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  location: string;
  description: string;
  date: string;
  source: string;
  expires?: string;
  active: boolean;
}

export interface EmergencyService {
  id: string;
  name: string;
  type: 'police' | 'fire' | 'medical' | 'general';
  phoneNumber: string;
  response_time?: number;
}
