
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
