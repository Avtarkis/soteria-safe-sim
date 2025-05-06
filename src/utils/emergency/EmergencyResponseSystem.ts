import { DetectionAlert } from '@/types/detection';
import { ThreatDetection } from '../ml/PoseDetectionService';
import { AudioThreatResult } from '../ml/AudioThreatDetection';
import { HealthEvent } from '../ml/HealthMonitorService';
import { emergencyService } from '@/services/emergencyService';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import React from 'react';

export interface EmergencyEvent {
  type: 'weapon' | 'fall' | 'audio' | 'health' | 'manual';
  subtype?: string;
  confidence: number;
  timestamp: number;
  location?: [number, number];
  details?: string;
  source: 'pose' | 'audio' | 'sensor' | 'voice' | 'manual';
}

export interface EmergencyAction {
  type: 'sms' | 'call' | 'record' | 'notify' | 'siren' | 'broadcast';
  target?: string;
  data?: any;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  priority: number;
}

export interface EmergencySettings {
  autoNotifyContacts: boolean;
  autoCallEmergencyServices: boolean;
  autoRecord: boolean;
  confidenceThreshold: number;
  emergencyContacts: EmergencyContact[];
}

export class EmergencyResponseSystem {
  private static instance: EmergencyResponseSystem;
  private isActive = false;
  private emergencyActive = false;
  private lastEmergencyEvent: EmergencyEvent | null = null;
  private emergencyActions: EmergencyAction[] = [];
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
    
    // Map intents to emergency types
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
    
    const emergencyEvent: EmergencyEvent = {
      type,
      subtype,
      confidence,
      timestamp: Date.now(),
      details: `Voice command detected: "${intent}"`,
      source: 'voice'
    };
    
    this.processEmergencyEvent(emergencyEvent);
  }
  
  public handleManualTrigger(type: string): void {
    if (!this.isActive) return;
    
    console.log('Handling manual trigger:', type);
    
    const emergencyEvent: EmergencyEvent = {
      type: 'manual',
      subtype: type,
      confidence: 1.0, // Manual trigger is always 100% confidence
      timestamp: Date.now(),
      details: `Manual emergency activation: ${type}`,
      source: 'manual'
    };
    
    this.processEmergencyEvent(emergencyEvent, true); // Skip countdown for manual triggers
  }
  
  private handleEmergencyCall(): void {
    try {
      this.handleManualTrigger('call');
      
      toast({
        title: "Emergency Call",
        description: "Initiating emergency call to your contacts...",
      });
    } catch (error) {
      console.error('Error handling emergency call:', error);
    }
  }
  
  private handleEmergencySMS(): void {
    try {
      this.handleManualTrigger('sms');
      
      toast({
        title: "Emergency SMS",
        description: "Sending emergency SMS to your contacts...",
      });
    } catch (error) {
      console.error('Error handling emergency SMS:', error);
    }
  }
  
  private handleSOSAlert(): void {
    try {
      this.handleManualTrigger('sos');
      
      toast({
        title: "SOS Alert Activated",
        description: "Emergency services have been notified of your situation.",
      });
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
    
    // Show countdown notification with the correct toast action format
    toast({
      title: "Emergency Countdown Started",
      description: `Emergency actions will be triggered in ${this.emergencyCountdown} seconds. Tap to cancel.`,
      action: <ToastAction 
        altText="Cancel emergency countdown" 
        onClick={() => this.cancelEmergency()}
      >
        Cancel
      </ToastAction>,
      duration: 10000, // 10 seconds
    });
    
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
    
    toast({
      title: "Emergency Cancelled",
      description: "Emergency response actions have been cancelled.",
    });
  }
  
  private triggerEmergency(): void {
    this.emergencyActive = true;
    
    // Determine appropriate actions based on the event
    this.determineEmergencyActions();
    
    // Execute actions
    this.executeEmergencyActions();
    
    // Create a detection alert
    this.createDetectionAlert();
    
    toast({
      title: "Emergency Activated",
      description: "Emergency response actions are being executed.",
      variant: "destructive",
      duration: 15000,
    });
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
      case 'fall':
        // For falls, focus on medical assistance
        break;
      case 'health':
        // For health issues, similar to falls
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
            this.sendEmergencySMS();
            break;
          case 'call':
            this.makeEmergencyCall();
            break;
          case 'record':
            this.startRecording();
            break;
          case 'notify':
            this.notifyUser();
            break;
          case 'siren':
            this.activateSiren();
            break;
          case 'broadcast':
            this.broadcastAlert();
            break;
        }
      } catch (error) {
        console.error(`Error executing emergency action ${action.type}:`, error);
      } finally {
        this.actionsInProgress.delete(actionKey);
      }
    });
  }
  
  private createDetectionAlert(): void {
    if (!this.lastEmergencyEvent) return;
    
    // Create a detection alert to display on the map
    const alert: DetectionAlert = {
      id: `emergency-${Date.now()}`,
      title: this.getEmergencyTitle(),
      description: this.lastEmergencyEvent.details || 'Emergency situation detected',
      level: 3, // High level alert
      timestamp: new Date().toISOString(),
      location: this.lastEmergencyEvent.location,
      weaponType: this.lastEmergencyEvent.type === 'weapon' ? this.lastEmergencyEvent.subtype : undefined,
      confidence: this.lastEmergencyEvent.confidence,
      verified: this.lastEmergencyEvent.source === 'manual'
    };
    
    // Dispatch event to be picked up by the map
    try {
      const event = new CustomEvent('weaponDetected', { detail: alert });
      document.dispatchEvent(event);
    } catch (error) {
      console.error('Error dispatching weapon detection event:', error);
    }
  }
  
  private getEmergencyTitle(): string {
    if (!this.lastEmergencyEvent) return 'Emergency Alert';
    
    switch (this.lastEmergencyEvent.type) {
      case 'weapon':
        return 'Weapon Threat Detected';
      case 'fall':
        return 'Fall Detected';
      case 'health':
        return 'Health Emergency';
      case 'audio':
        if (this.lastEmergencyEvent.subtype === 'gunshot') return 'Gunshot Detected';
        if (this.lastEmergencyEvent.subtype === 'scream') return 'Scream Detected';
        if (this.lastEmergencyEvent.subtype === 'explosion') return 'Explosion Detected';
        return `Audio Threat: ${this.lastEmergencyEvent.subtype}`;
      case 'manual':
        return 'SOS Emergency Alert';
      default:
        return 'Emergency Alert';
    }
  }
  
  private sendEmergencySMS(): void {
    try {
      // Using the existing sendSms function
      document.dispatchEvent(new CustomEvent('sendSms'));
      
      console.log('Emergency SMS sent');
    } catch (error) {
      console.error('Error sending emergency SMS:', error);
    }
  }
  
  private makeEmergencyCall(): void {
    try {
      // Using the existing makeCall function
      document.dispatchEvent(new CustomEvent('makeCall'));
      
      console.log('Emergency call initiated');
    } catch (error) {
      console.error('Error making emergency call:', error);
    }
  }
  
  private startRecording(): void {
    try {
      // Trigger recording system
      document.dispatchEvent(new CustomEvent('startEmergencyRecording'));
      
      console.log('Emergency recording started');
    } catch (error) {
      console.error('Error starting emergency recording:', error);
    }
  }
  
  private notifyUser(): void {
    toast({
      title: this.getEmergencyTitle(),
      description: this.lastEmergencyEvent?.details || 'Emergency actions are being taken.',
      variant: "destructive",
      duration: 30000,
    });
  }
  
  private activateSiren(): void {
    try {
      // Trigger siren
      document.dispatchEvent(new CustomEvent('activateEmergencySiren'));
      
      console.log('Emergency siren activated');
    } catch (error) {
      console.error('Error activating emergency siren:', error);
    }
  }
  
  private broadcastAlert(): void {
    try {
      // Broadcast alert to nearby devices
      document.dispatchEvent(new CustomEvent('broadcastEmergencyAlert'));
      
      console.log('Emergency alert broadcasted');
    } catch (error) {
      console.error('Error broadcasting emergency alert:', error);
    }
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
