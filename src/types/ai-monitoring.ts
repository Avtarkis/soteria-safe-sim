
export interface AIThreatDetection {
  id?: string;
  type?: string;
  subtype?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  confidence?: number; // Make sure confidence exists
  details?: string;
  source?: string;
  timestamp?: number;
}
