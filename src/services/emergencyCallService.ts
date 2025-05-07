
import React from 'react';
import { createRoot } from 'react-dom/client';
import PhoneCallSimulator from '@/components/emergency/PhoneCallSimulator';
import { EmergencyEvent } from '@/utils/emergency/types';

// Emergency call messages for different scenarios
const EMERGENCY_MESSAGES = {
  default: "Your location has been recorded. The attackers' faces are now in our system. Police are on their way. Stay calm and stay safe.",
  weapon: "This is an emergency alert. We have detected a potential weapon threat near you. Police units have been dispatched to your location. Please remain calm and seek shelter immediately.",
  fall: "Emergency services have been notified of your fall. Medical assistance is on the way to your current location. Please remain still if possible.",
  health: "Medical emergency detected. A response team has been notified and is en route to your location. Help is on the way.",
  audio: "We detected a distress sound at your location. Emergency services have been dispatched. If safe to do so, please seek shelter and wait for responders.",
  sos: "SOS received. Police have been dispatched to your location. Your location is being tracked in real-time. Help is on the way.",
};

export type EmergencyCallType = keyof typeof EMERGENCY_MESSAGES;

export interface SimulatedCallOptions {
  callerName?: string;
  message?: string;
  autoAnswerDelay?: number;
  onComplete?: () => void;
  onCancel?: () => void;
}

class EmergencyCallService {
  private activeCallContainer: HTMLDivElement | null = null;
  private activeCallRoot: ReturnType<typeof createRoot> | null = null;
  private isCallActive = false;

  /**
   * Start a simulated emergency call
   */
  public startEmergencyCall(
    callType: EmergencyCallType = 'default', 
    options: SimulatedCallOptions = {}
  ): void {
    if (this.isCallActive) {
      console.warn('Emergency call is already active');
      return;
    }
    
    this.isCallActive = true;
    
    // Create container for the call UI
    const callContainer = document.createElement('div');
    callContainer.id = 'emergency-call-container';
    document.body.appendChild(callContainer);
    
    this.activeCallContainer = callContainer;
    this.activeCallRoot = createRoot(callContainer);
    
    // Get message based on call type
    const message = options.message || EMERGENCY_MESSAGES[callType] || EMERGENCY_MESSAGES.default;
    
    // Determine appropriate caller name based on call type
    let callerName = options.callerName || 'Emergency Services';
    
    switch (callType) {
      case 'weapon':
        callerName = 'Police Emergency';
        break;
      case 'fall':
      case 'health':
        callerName = 'Medical Response';
        break;
      case 'sos':
        callerName = 'Emergency Response Unit';
        break;
      default:
        callerName = 'Emergency Services';
    }

    // Trigger device vibration pattern to simulate incoming call
    if ('vibrate' in navigator) {
      // Pattern: vibrate 1s, pause 0.5s, vibrate 1s, etc.
      navigator.vibrate([1000, 500, 1000, 500, 1000]);
    }
    
    // Render the phone call simulator
    this.activeCallRoot.render(
      <PhoneCallSimulator
        callerName={callerName}
        message={message}
        autoAnswerDelay={options.autoAnswerDelay || 5000}
        onComplete={() => {
          this.endEmergencyCall();
          if (options.onComplete) options.onComplete();
        }}
        onCancel={() => {
          this.endEmergencyCall();
          if (options.onCancel) options.onCancel();
        }}
      />
    );
    
    // Play ringtone through standard audio API
    try {
      const audio = new Audio('/sounds/emergency-ring.mp3');
      audio.loop = true;
      audio.play().catch(err => console.error('Error playing ringtone:', err));
      
      // Stop the ringtone after 10 seconds if not already stopped
      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 10000);
    } catch (error) {
      console.error('Error playing ringtone:', error);
    }
  }
  
  /**
   * End the currently active emergency call
   */
  public endEmergencyCall(): void {
    if (!this.isCallActive) return;
    
    // Clean up
    if (this.activeCallRoot && this.activeCallContainer) {
      this.activeCallRoot.unmount();
      if (this.activeCallContainer.parentNode) {
        this.activeCallContainer.parentNode.removeChild(this.activeCallContainer);
      }
      this.activeCallContainer = null;
      this.activeCallRoot = null;
    }
    
    this.isCallActive = false;
    
    // Stop any vibrations
    if ('vibrate' in navigator) {
      navigator.vibrate(0); // Stop vibration
    }
  }
  
  /**
   * Check if there's an active emergency call
   */
  public isCallInProgress(): boolean {
    return this.isCallActive;
  }
  
  /**
   * Start a simulated emergency call based on an emergency event
   */
  public startCallFromEmergencyEvent(event: EmergencyEvent, options: SimulatedCallOptions = {}): void {
    let callType: EmergencyCallType = 'default';
    
    // Map emergency event type to call type
    switch (event.type) {
      case 'weapon':
        callType = 'weapon';
        break;
      case 'fall':
        callType = 'fall';
        break;
      case 'health':
        callType = 'health';
        break;
      case 'audio':
        callType = 'audio';
        break;
      case 'manual':
        callType = event.subtype === 'sos' ? 'sos' : 'default';
        break;
    }
    
    this.startEmergencyCall(callType, options);
  }
}

// Export singleton instance
const emergencyCallService = new EmergencyCallService();
export default emergencyCallService;
