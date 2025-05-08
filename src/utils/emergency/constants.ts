
// AI detection confidence thresholds
export const AI_DETECTION_THRESHOLD = 0.75; // Minimum confidence for AI detections to be considered valid
export const VOICE_DETECTION_THRESHOLD = 0.65; // Minimum confidence for voice commands to trigger emergency

// Emergency response timing
export const EMERGENCY_ALERT_DELAY_MS = 3000; // Delay before sending emergency alerts
export const EMERGENCY_CALL_DELAY_MS = 5000; // Delay before initiating emergency calls

// Alert priority levels
export const ALERT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// System response modes
export const RESPONSE_MODE = {
  SILENT: 'silent',      // No sounds or notifications
  DISCREET: 'discreet',  // Quiet notifications only
  FULL: 'full'           // Full alerts with sounds
};
