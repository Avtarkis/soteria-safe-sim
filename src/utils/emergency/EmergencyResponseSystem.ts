
import { DetectionAlert } from '@/types/detection';
import { ThreatDetection } from '../ml/PoseDetectionService';
import { AudioThreatResult } from '../ml/AudioThreatDetection';
import { HealthEvent } from '../ml/HealthMonitorService';
import { 
  EmergencyEvent, 
  EmergencyAction,
  EmergencySettings 
} from './types';
import {
  sendEmergencySMS,
  makeEmergencyCall,
  startRecording,
  notifyUser,
  activateSiren,
  broadcastAlert
} from './actions/emergencyActions';
import { NotificationManager } from './managers/NotificationManager';
import { EmergencyEventManager } from './managers/EmergencyEventManager';

export class EmergencyResponseSystem {
  private static instance: EmergencyResponseSystem;
  private isActive = false;
  private emergencyActive = false;
  private lastEmergencyEvent: EmergencyEvent | null = null;
  private settings: EmergencySettings;
  private actionsInProgress: Set<string> = new Set();
  private pendingActions: EmergencyAction[] = [];
  private emergencyTimer: number | null = null;
  private emergencyCountdown = 10; // seconds
  
  private constructor() {
    // Default settings
    this.settings = {
      autoNotifyContacts: true,
      autoCallEmergencyServices: false,
      autoRecord: true,
      confidenceThreshold: 0.7,
      emergencyContacts: []
    };
    
    // Listen for manual emergency triggers
    document.addEventListener('emergencyCallTriggered', this.handleEmergencyCall.bind(this));
    document.addEventListener('emergencySMSTriggered', this.handleEmergencySMS.bind(this));
    document.addEventListener('SOSAlertTriggered', this.handleSOSAlert.bind(this));
  }
  
  public static getInstance(): EmergencyResponseSystem {
    if (!EmergencyResponseSystem.instance) {
      EmergencyResponseSystem.instance = new EmergencyResponseSystem();
    }
    return EmergencyResponseSystem.instance;
  }
  
  public activate(): boolean {
    if (this.isActive) return true;
    
    this.isActive = true;
    console.log('Emergency response system activated');
    return true;
  }
  
  public deactivate(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.cancelEmergency();
    console.log('Emergency response system deactivated');
  }
  
  public handleThreatDetection(detection: ThreatDetection): void {
    if (!this.isActive || !detection) return;
    
    console.log('Handling threat detection:', detection);
    
    // Check confidence threshold
    if (detection.confidence < this.settings.confidenceThreshold) {
      console.log('Threat detection below confidence threshold:', detection.confidence);
      return;
    }
    
    const emergencyEvent: EmergencyEvent = {
      type: detection.type === 'weapon' ? 'weapon' : 
            detection.type === 'fall' ? 'fall' : 'health',
      subtype: detection.type,
      confidence: detection.confidence,
      timestamp: Date.now(),
      details: detection.details,
      source: 'pose'
    };
    
    this.processEmergencyEvent(emergencyEvent);
  }
  
  public handleAudioThreat(audioThreat: AudioThreatResult): void {
    if (!this.isActive || !audioThreat || !audioThreat.detected) return;
    
    console.log('Handling audio threat:', audioThreat);
    
    // Check confidence threshold
    if (audioThreat.confidence < this.settings.confidenceThreshold) {
      console.log('Audio threat below confidence threshold:', audioThreat.confidence);
      return;
    }
    
    const emergencyEvent: EmergencyEvent = {
      type: 'audio',
      subtype: audioThreat.type,
      confidence: audioThreat.confidence,
      timestamp: audioThreat.timestamp,
      details: `Detected ${audioThreat.type} sound with ${Math.round(audioThreat.confidence * 100)}% confidence`,
      source: 'audio'
    };
    
    this.processEmergencyEvent(emergencyEvent);
  }
  
  public handleHealthEvent(healthEvent: HealthEvent): void {
    if (!this.isActive || healthEvent.type === 'normal') return;
    
    console.log('Handling health event:', healthEvent);
    
    // Check confidence threshold
    if (healthEvent.confidence < this.settings.confidenceThreshold) {
      console.log('Health event below confidence threshold:', healthEvent.confidence);
      return;
    }
    
    const emergencyEvent: EmergencyEvent = {
      type: 'health',
      subtype: healthEvent.type,
      confidence: healthEvent.confidence,
      timestamp: healthEvent.timestamp,
      details: healthEvent.details,
      source: 'sensor'
    };
    
    this.processEmergencyEvent(emergencyEvent);
  }
  
  public handleVoiceTrigger(intent: string, confidence: number): void {
    if (!this.isActive) return;
    
    console.log('Handling voice trigger:', intent, confidence);
    
    // Check confidence threshold
    if (confidence < this.settings.confidenceThreshold) {
      console.log('Voice trigger below confidence threshold:', confidence);
      return;
    }
    
    // Create voice emergency event
    const emergencyEvent = EmergencyEventManager.createVoiceEvent(intent, confidence);
    
    this.processEmergencyEvent(emergencyEvent);
  }
  
  public handleManualTrigger(type: string): void {
    if (!this.isActive) return;
    
    console.log('Handling manual trigger:', type);
    
    // Create manual emergency event
    const emergencyEvent = EmergencyEventManager.createManualEvent(type);
    
    this.processEmergencyEvent(emergencyEvent, true); // Skip countdown for manual triggers
  }
  
  private handleEmergencyCall(): void {
    try {
      this.handleManualTrigger('call');
      NotificationManager.showEmergencyCallNotification();
    } catch (error) {
      console.error('Error handling emergency call:', error);
    }
  }
  
  private handleEmergencySMS(): void {
    try {
      this.handleManualTrigger('sms');
      NotificationManager.showEmergencySMSNotification();
    } catch (error) {
      console.error('Error handling emergency SMS:', error);
    }
  }
  
  private handleSOSAlert(): void {
    try {
      this.handleManualTrigger('sos');
      NotificationManager.showSOSNotification();
    } catch (error) {
      console.error('Error handling SOS alert:', error);
    }
  }
  
  private processEmergencyEvent(event: EmergencyEvent, skipCountdown = false): void {
    console.log('Processing emergency event:', event);
    
    this.lastEmergencyEvent = event;
    
    // Check if we already have an active emergency
    if (this.emergencyActive) {
      console.log('Emergency already active, adding to context');
      return;
    }
    
    // Start emergency countdown or trigger immediately
    if (skipCountdown) {
      this.triggerEmergency();
    } else {
      this.startEmergencyCountdown();
    }
  }
  
  private startEmergencyCountdown(): void {
    if (this.emergencyTimer !== null) {
      window.clearInterval(this.emergencyTimer);
    }
    
    this.emergencyCountdown = 10;
    
    // Use the notification manager to show countdown
    NotificationManager.showCountdownNotification(
      this.emergencyCountdown,
      () => this.cancelEmergency()
    );
    
    this.emergencyTimer = window.setInterval(() => {
      this.emergencyCountdown--;
      
      if (this.emergencyCountdown <= 0) {
        if (this.emergencyTimer !== null) {
          window.clearInterval(this.emergencyTimer);
          this.emergencyTimer = null;
        }
        this.triggerEmergency();
      }
    }, 1000);
  }
  
  private cancelEmergency(): void {
    if (this.emergencyTimer !== null) {
      window.clearInterval(this.emergencyTimer);
      this.emergencyTimer = null;
    }
    
    this.emergencyActive = false;
    this.lastEmergencyEvent = null;
    this.pendingActions = [];
    this.actionsInProgress.clear();
    
    NotificationManager.showCancellationNotification();
  }
  
  private triggerEmergency(): void {
    this.emergencyActive = true;
    
    // Determine appropriate actions based on the event
    this.determineEmergencyActions();
    
    // Execute actions
    this.executeEmergencyActions();
    
    // Process the event
    if (this.lastEmergencyEvent) {
      EmergencyEventManager.processDetection(this.lastEmergencyEvent);
    }
  }
  
  private determineEmergencyActions(): void {
    if (!this.lastEmergencyEvent) return;
    
    const actions: EmergencyAction[] = [];
    
    // Add actions based on settings and event type
    if (this.settings.autoNotifyContacts) {
      actions.push({ type: 'sms' });
    }
    
    if (this.settings.autoCallEmergencyServices || 
        this.lastEmergencyEvent.type === 'weapon' || 
        this.lastEmergencyEvent.subtype === 'sos') {
      actions.push({ type: 'call' });
    }
    
    if (this.settings.autoRecord) {
      actions.push({ type: 'record' });
    }
    
    // Always notify the user
    actions.push({ type: 'notify' });
    
    // Add more specific actions based on event type
    switch (this.lastEmergencyEvent.type) {
      case 'weapon':
        // For weapon detection, prioritize calling emergency services
        actions.push({ type: 'siren' });
        actions.push({ type: 'broadcast' });
        break;
      case 'audio':
        // For audio threats, similar to weapon detection
        if (this.lastEmergencyEvent.subtype === 'gunshot' || 
            this.lastEmergencyEvent.subtype === 'scream' || 
            this.lastEmergencyEvent.subtype === 'explosion') {
          actions.push({ type: 'siren' });
          actions.push({ type: 'broadcast' });
        }
        break;
    }
    
    this.pendingActions = actions;
  }
  
  private executeEmergencyActions(): void {
    // Process each action
    this.pendingActions.forEach(action => {
      const actionKey = `${action.type}:${action.target || 'default'}`;
      
      // Skip if already in progress
      if (this.actionsInProgress.has(actionKey)) {
        return;
      }
      
      this.actionsInProgress.add(actionKey);
      
      try {
        switch (action.type) {
          case 'sms':
            sendEmergencySMS();
            break;
          case 'call':
            makeEmergencyCall();
            break;
          case 'record':
            startRecording();
            break;
          case 'notify':
            // This is handled separately in EmergencyEventManager
            break;
          case 'siren':
            activateSiren();
            break;
          case 'broadcast':
            broadcastAlert();
            break;
        }
      } catch (error) {
        console.error(`Error executing emergency action ${action.type}:`, error);
      } finally {
        this.actionsInProgress.delete(actionKey);
      }
    });
  }
  
  public updateSettings(newSettings: Partial<EmergencySettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }
  
  public isEmergencyActive(): boolean {
    return this.emergencyActive;
  }
  
  public getLastEmergencyEvent(): EmergencyEvent | null {
    return this.lastEmergencyEvent;
  }
}

// Create and export singleton instance
const instance = EmergencyResponseSystem.getInstance();
export default instance;

// Use 'export type' for re-exporting types when isolatedModules is enabled
export type { EmergencyEvent, EmergencyAction, EmergencySettings } from './types';
