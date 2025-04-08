
// Disaster Alerts Types
export type DisasterAlertType = 'earthquake' | 'wildfire' | 'flood' | 'storm' | 'extreme_heat';
export type DisasterAlertSeverity = 'advisory' | 'watch' | 'warning';

export interface DisasterAlert {
  id: string;
  title: string;
  type: DisasterAlertType;
  severity: DisasterAlertSeverity;
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  description: string;
  source: string;
}
