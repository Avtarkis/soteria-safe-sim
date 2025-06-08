
import { ThreatAlert } from '@/lib/supabase';

export const sampleThreats: ThreatAlert[] = [
  {
    id: '1',
    title: 'High Crime Rate Area',
    description: 'Increased reports of theft and robbery in downtown area. Avoid walking alone after dark.',
    severity: 'high',
    location: {
      lat: 37.7849,
      lng: -122.4094
    },
    timestamp: '2024-01-15T14:30:00Z',
    source: 'Police Department',
    type: 'crime'
  },
  {
    id: '2',
    title: 'Data Breach Alert',
    description: 'Major retail chain compromised. Check if your email was affected.',
    severity: 'medium',
    location: {
      lat: 37.7749,
      lng: -122.4194
    },
    timestamp: '2024-01-15T12:00:00Z',
    source: 'Cybersecurity Firm',
    type: 'cybersecurity'
  },
  {
    id: '3',
    title: 'Severe Weather Warning',
    description: 'Heavy rain and wind expected. Exercise caution when traveling.',
    severity: 'medium',
    location: {
      lat: 37.7649,
      lng: -122.4294
    },
    timestamp: '2024-01-15T10:15:00Z',
    source: 'Weather Service',
    type: 'weather'
  }
];
