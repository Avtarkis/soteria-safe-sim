
import { EmergencyEvent } from '../types';
import { DetectionAlert } from '@/types/detection';

/**
 * Creates a detection alert from an emergency event
 */
export const createDetectionAlert = (emergencyEvent: EmergencyEvent | null): DetectionAlert | null => {
  if (!emergencyEvent) return null;
  
  // Create a detection alert to display on the map
  const alert: DetectionAlert = {
    id: `emergency-${Date.now()}`,
    title: getEmergencyTitle(emergencyEvent),
    description: emergencyEvent.details || 'Emergency situation detected',
    level: 3, // High level alert
    timestamp: new Date().toISOString(),
    location: emergencyEvent.location,
    weaponType: emergencyEvent.type === 'weapon' ? emergencyEvent.subtype : undefined,
    confidence: emergencyEvent.confidence,
    verified: emergencyEvent.source === 'manual'
  };
  
  return alert;
};

/**
 * Dispatches a detection alert event
 */
export const dispatchDetectionAlert = (alert: DetectionAlert): void => {
  try {
    const event = new CustomEvent('weaponDetected', { detail: alert });
    document.dispatchEvent(event);
  } catch (error) {
    console.error('Error dispatching weapon detection event:', error);
  }
};

/**
 * Gets the appropriate title for an emergency event
 */
export const getEmergencyTitle = (emergencyEvent: EmergencyEvent): string => {
  switch (emergencyEvent.type) {
    case 'weapon':
      return 'Weapon Threat Detected';
    case 'fall':
      return 'Fall Detected';
    case 'health':
      return 'Health Emergency';
    case 'audio':
      if (emergencyEvent.subtype === 'gunshot') return 'Gunshot Detected';
      if (emergencyEvent.subtype === 'scream') return 'Scream Detected';
      if (emergencyEvent.subtype === 'explosion') return 'Explosion Detected';
      return `Audio Threat: ${emergencyEvent.subtype}`;
    case 'manual':
      return 'SOS Emergency Alert';
    default:
      return 'Emergency Alert';
  }
};
