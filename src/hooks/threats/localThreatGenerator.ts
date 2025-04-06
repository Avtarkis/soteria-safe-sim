
import { ThreatMarker } from '@/types/threats';

// Generate realistic, non-alarming local threats based on location
export const generateLocalThreats = (userLocation: [number, number]): ThreatMarker[] => {
  // Create only 1-2 low threats that are realistic and non-alarming
  const threats: ThreatMarker[] = [];
  
  // Add a traffic information notice (very common and non-alarming)
  if (Math.random() > 0.4) {
    threats.push({
      id: `traffic-${Date.now()}-1`,
      position: [
        userLocation[0] + 0.0005 + (Math.random() * 0.001), 
        userLocation[1] - 0.0004 - (Math.random() * 0.001)
      ] as [number, number],
      level: 'low' as 'low',
      title: 'Traffic Information',
      details: 'Regular traffic flow in nearby streets. No significant delays reported.',
      type: 'physical'
    });
  }
  
  // Add a general area information notice (non-alarming)
  if (Math.random() < 0.3) {
    threats.push({
      id: `info-local-${Date.now()}`,
      position: [
        userLocation[0] + 0.0002 + (Math.random() * 0.0005), 
        userLocation[1] + 0.0002 + (Math.random() * 0.0005)
      ] as [number, number],
      level: 'low' as 'low',
      title: 'Area Information',
      details: 'General area information for local residents and visitors.',
      type: 'physical'
    });
  }
  
  return threats;
};

// Generate fallback threats that are realistic and not alarming
export const generateFallbackThreats = (userLocation: [number, number]): ThreatMarker[] => {
  return [
    {
      id: `fallback-${Date.now()}-1`,
      position: [
        userLocation[0] + 0.0015 + (Math.random() * 0.0005), 
        userLocation[1] - 0.0010 - (Math.random() * 0.0005)
      ],
      level: 'low' as 'low',
      title: 'Local Information',
      details: 'General information about your current area.',
      type: 'physical'
    }
  ];
};
