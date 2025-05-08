
import React from 'react';
import { toast } from '@/hooks/use-toast';
import { EmergencyEvent, EmergencyResponseOptions } from './types';
import { createDetectionAlert } from './handlers/eventProcessors';
import { AI_DETECTION_THRESHOLD, VOICE_DETECTION_THRESHOLD } from './constants';
import { triggerEmergencyMode } from '@/services/SecureDefenseSystem';

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
        triggerEmergencyMode({
          type: this.mapTypeToAIThreatType(type),
          subtype: type,
          description: details || `AI detected a ${type} threat`,
          confidence: confidence,
          severity: confidence > 0.9 ? 'critical' : 'high',
        });
      }
    }
  }
  
  // Map generic type to AIThreatDetection type
  private mapTypeToAIThreatType(type: string): 'health' | 'security' | 'environment' {
    if (type === 'weapon' || type === 'threat' || type === 'danger') {
      return 'security';
    } else if (type === 'fall' || type === 'medical' || type === 'health') {
      return 'health';
    } else {
      return 'environment';
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
    triggerEmergencyMode({
      type: this.detectEmergencyTypeFromText(transcript),
      subtype: 'voice',
      description: `Voice command: "${transcript}"`,
      confidence: confidence,
      source: 'voice',
    });
  }
  
  // Detect type of emergency from text
  private detectEmergencyTypeFromText(text: string): 'health' | 'security' | 'environment' {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('weapon') || lowerText.includes('gun') || 
        lowerText.includes('threat') || lowerText.includes('attack')) {
      return 'security';
    } else if (lowerText.includes('medical') || lowerText.includes('hurt') || 
               lowerText.includes('fall') || lowerText.includes('health')) {
      return 'health';
    } else {
      // Default to security for general emergency calls
      return 'security';
    }
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
    triggerEmergencyMode({
      type: this.mapTypeToAIThreatType(eventType),
      subtype: eventType,
      description: options.details || `Manual ${eventType} emergency trigger`,
      confidence: 1.0,
      severity: 'high',
      source: 'manual',
    });
  }
}

// Export singleton instance
const emergencyResponseSystem = new EmergencyResponseSystem();
export default emergencyResponseSystem;
