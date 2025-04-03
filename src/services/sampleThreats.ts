
import { ThreatAlert } from '@/lib/supabase';
import { ThreatMarker } from '@/types/threats';

export const sampleThreats = {
  // Generate sample threats for development or fallback
  generateSampleThreats: (userId: string, count = 3): ThreatAlert[] => {
    const threats = [
      {
        id: '1',
        user_id: userId,
        title: 'Suspicious Login Attempt',
        description: 'Someone tried to log into your account from an unrecognized device in Moscow, Russia.',
        level: 'high' as const,
        action: 'Secure Account',
        resolved: false,
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        latitude: 55.7558, // Moscow
        longitude: 37.6173
      },
      {
        id: '2',
        user_id: userId,
        title: 'High Crime Area Alert',
        description: 'You are entering an area with recent reports of mugging incidents.',
        level: 'medium' as const,
        action: 'View Safe Routes',
        resolved: false,
        created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        latitude: 40.7128, // New York
        longitude: -74.0060
      },
      {
        id: '3',
        user_id: userId,
        title: 'Weather Advisory',
        description: 'Flash flood warning in your current location for the next 24 hours.',
        level: 'low' as const,
        action: 'See Details',
        resolved: false,
        created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        latitude: 34.0522, // Los Angeles
        longitude: -118.2437
      },
      {
        id: '4',
        user_id: userId,
        title: 'Data Breach Detected',
        description: 'Your email was found in a recent data breach. Change your passwords immediately.',
        level: 'high' as const,
        action: 'Change Passwords',
        resolved: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        latitude: 51.5074, // London
        longitude: -0.1278
      }
    ];
    
    return threats.slice(0, count);
  },

  // Additional sample threats when API data is insufficient
  getAdditionalThreats: (userLocation?: [number, number]): ThreatMarker[] => {
    return [
      {
        id: 'cyber-1',
        position: userLocation ? [userLocation[0] + 0.2, userLocation[1] + 0.3] : [37.7749, -122.4194],
        level: 'high',
        title: 'DDoS Attack',
        details: 'Major distributed denial of service attack targeting tech companies in this region.',
        type: 'cyber'
      },
      {
        id: 'cyber-2',
        position: userLocation ? [userLocation[0] - 0.1, userLocation[1] - 0.2] : [40.7128, -74.006],
        level: 'medium',
        title: 'Ransomware Alert',
        details: 'Financial institutions reporting ransomware attempts. Implement security protocols.',
        type: 'cyber'
      },
      {
        id: 'physical-1',
        position: userLocation ? [userLocation[0] + 0.05, userLocation[1] - 0.15] : [34.0522, -118.2437],
        level: 'medium',
        title: 'Street Crime Warning',
        details: 'Recent increase in street theft and muggings reported in this neighborhood.',
        type: 'physical'
      }
    ];
  },

  // Fallback threats when all APIs fail
  getFallbackThreats: (userLocation?: [number, number]): ThreatMarker[] => {
    return [
      {
        id: '1',
        position: userLocation ? [userLocation[0] + 0.1, userLocation[1] - 0.1] : [37.7749, -122.4194],
        level: 'high',
        title: 'Data Breach Alert',
        details: 'Major data breach reported in this area affecting financial institutions.',
        type: 'cyber'
      },
      {
        id: '2',
        position: userLocation ? [userLocation[0] - 0.05, userLocation[1] + 0.05] : [34.0522, -118.2437],
        level: 'medium',
        title: 'Street Crime Warning',
        details: 'Recent increase in street theft and muggings reported in this neighborhood.',
        type: 'physical'
      },
      {
        id: '3',
        position: userLocation ? [userLocation[0], userLocation[1] + 0.2] : [51.5074, -0.1278],
        level: 'low',
        title: 'Weather Advisory',
        details: 'Potential flooding in low-lying areas due to heavy rainfall forecast.',
        type: 'environmental'
      }
    ];
  }
};
