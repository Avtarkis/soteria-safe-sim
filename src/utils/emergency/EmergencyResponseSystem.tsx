
import React from 'react';
import { toast } from '@/hooks/use-toast';
import { EmergencyEvent, EmergencyResponseOptions } from './types';
import { createDetectionAlert } from './handlers/eventProcessors';
import { AI_DETECTION_THRESHOLD, VOICE_DETECTION_THRESHOLD } from './constants';
import secureDefenseSystem from '@/services/SecureDefenseSystem';

class EmergencyResponseSystem {
  // Handle a threat detection from AI models
  public handleThreatDetection(
    type: string, 
    confidence: number,
    details: string = ''
  ): void {
    // Only process high-confidence detections
    if (confidence < AI_DETECTION_THRESHOLD) {
      return;
    }
    
    console.log(`EmergencyResponseSystem: Handling ${type} threat detection with confidence ${confidence}`);
    
    // Create emergency event
    const event: EmergencyEvent = {
      type: type as any, // Cast to the appropriate type
      subtype: '',
      confidence,
      timestamp: Date.now(),
      details: details || `AI detected a ${type} threat`,
      source: 'ai'
    };
    
    // Process the event through the detection alert system
    const alert = createDetectionAlert(event);
    
    if (alert) {
      // Display the alert
      toast({
        title: alert.title,
        description: alert.description,
        variant: "destructive",
        duration: 10000,
      });
      
      // Trigger emergency actions on the secure defense system
      if (type === 'weapon' || type === 'fall' || confidence > 0.85) {
        secureDefenseSystem.triggerEmergencyMode();
      }
    }
  }
  
  // Handle a voice command that triggers emergency response
  public handleVoiceTrigger(
    transcript: string,
    confidence: number
  ): void {
    // Only process high-confidence transcripts
    if (confidence < VOICE_DETECTION_THRESHOLD) {
      return;
    }
    
    console.log(`EmergencyResponseSystem: Processing voice trigger: "${transcript}"`);
    
    // Log the event
    const event: EmergencyEvent = {
      type: 'manual',
      subtype: 'voice',
      confidence,
      timestamp: Date.now(),
      details: `Voice command: "${transcript}"`,
      source: 'voice'
    };
    
    // Forward to the secure defense system
    secureDefenseSystem.processVoiceCommand(transcript, confidence);
  }
  
  // Handle a manual emergency button press
  public handleManualTrigger(
    eventType: string,
    options: EmergencyResponseOptions = {}
  ): void {
    console.log(`EmergencyResponseSystem: Manual trigger for ${eventType}`);
    
    // Log the event
    const event: EmergencyEvent = {
      type: 'manual',
      subtype: eventType,
      confidence: 1.0, // Manual triggers have maximum confidence
      timestamp: Date.now(),
      details: options.details || `Manual ${eventType} emergency trigger`,
      source: 'manual'
    };
    
    // Forward to the secure defense system
    secureDefenseSystem.triggerEmergencyMode();
  }
}

// Export singleton instance
const emergencyResponseSystem = new EmergencyResponseSystem();
export default emergencyResponseSystem;
