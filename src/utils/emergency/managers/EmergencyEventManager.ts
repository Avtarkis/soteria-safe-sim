
import { EmergencyEvent } from '../types';
import { createDetectionAlert, dispatchDetectionAlert } from '../handlers/eventProcessors';
import { NotificationManager } from './NotificationManager';

export class EmergencyEventManager {
  /**
   * Process an emergency event
   */
  public static processDetection(event: EmergencyEvent): void {
    // Create a detection alert
    const alert = createDetectionAlert(event);
    
    // Dispatch the alert if it exists
    if (alert) {
      dispatchDetectionAlert(alert);
    }
    
    // Show notification
    NotificationManager.showEmergencyNotification(event);
  }
  
  /**
   * Map voice intent to emergency event type
   */
  public static mapVoiceIntentToEventType(intent: string): {
    type: EmergencyEvent['type'], 
    subtype: string
  } {
    let type: EmergencyEvent['type'] = 'manual';
    let subtype = intent;
    
    if (intent.includes('help') || intent.includes('emergency')) {
      type = 'manual';
      subtype = 'sos';
    } else if (intent.includes('fall') || intent.includes('fell')) {
      type = 'fall';
    } else if (intent.includes('sick') || intent.includes('dizzy') || intent.includes('faint')) {
      type = 'health';
    } else if (intent.includes('weapon') || intent.includes('gun') || intent.includes('knife')) {
      type = 'weapon';
    }
    
    return { type, subtype };
  }
  
  /**
   * Create an emergency event from voice trigger
   */
  public static createVoiceEvent(intent: string, confidence: number): EmergencyEvent {
    const { type, subtype } = this.mapVoiceIntentToEventType(intent);
    
    return {
      type,
      subtype,
      confidence,
      timestamp: Date.now(),
      details: `Voice command detected: "${intent}"`,
      source: 'voice'
    };
  }
  
  /**
   * Create an emergency event from manual trigger
   */
  public static createManualEvent(type: string): EmergencyEvent {
    return {
      type: 'manual',
      subtype: type,
      confidence: 1.0, // Manual trigger is always 100% confidence
      timestamp: Date.now(),
      details: `Manual emergency activation: ${type}`,
      source: 'manual'
    };
  }
}
