
import React, { useEffect, useRef, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { SensorManager } from '@/utils/sensors/SensorManager';
import { ThreatDetectionService } from '@/services/ThreatDetectionService';
import { StealthModeManager } from '@/services/StealthModeManager';
import { IncidentRecordingService } from '@/services/IncidentRecordingService'; 
import { EmergencyAlertService } from '@/services/EmergencyAlertService';
import { SensorDataPoint } from '@/utils/sensors/sensorTypes';
import emergencyCallService from '@/services/emergencyCallService';
import { ThreatDetection } from '@/utils/ml/PoseDetectionService';
import { deepgramService } from '@/services/deepgramService';
import { AIThreatDetection } from '@/types/ai-monitoring';

// Key thresholds for detection
const MOTION_SENSITIVITY = 5.0; // Higher values = less sensitive
const AUDIO_SENSITIVITY = 0.7; // Higher values = more sensitive (0-1)
const THREAT_CONFIRMATION_THRESHOLD = 2; // Number of indicators needed to confirm threat

// Emergency keywords that trigger immediate action
const EMERGENCY_KEYWORDS = [
  'help', 'gun', 'knife', 'weapon', 'hurt', 'danger', 'emergency',
  'police', 'attack', 'threat', 'scared', 'kill', 'die', 'shoot',
  'don\'t hurt', 'please stop', 'let me go', 'call police', 'scream'
];

class SecureDefenseSystem {
  private isActive: boolean = false;
  private isInitialized: boolean = false;
  private inEmergencyMode: boolean = false;
  private threatDetection: ThreatDetectionService | null = null;
  private stealthMode: StealthModeManager | null = null;
  private recordingService: IncidentRecordingService | null = null;
  private alertService: EmergencyAlertService | null = null;
  
  // State for threat analysis
  private possibleThreatCount: number = 0;
  private lastThreatCheckTime: number = 0;
  private threatCooldownPeriod: number = 30000; // 30 seconds between possible false alerts
  private consecutiveThreatDetections: number = 0;
  private listeners: ((status: SecuritySystemStatus) => void)[] = [];
  
  // Emergency context information
  private emergencyContext: EmergencyContext = {
    type: 'unknown',
    confidence: 0,
    evidence: {
      audio: false,
      motion: false, 
      vision: false,
      voice: false
    },
    detectionTimestamp: 0,
    status: 'normal'
  };

  constructor() {
    console.log('SecureDefenseSystem: Initializing security system');
  }

  /**
   * Initialize the security system
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      console.log('SecureDefenseSystem: Starting initialization');
      
      // Initialize sub-services
      this.threatDetection = new ThreatDetectionService();
      await this.threatDetection.initialize();
      
      this.stealthMode = new StealthModeManager();
      this.recordingService = new IncidentRecordingService();
      this.alertService = new EmergencyAlertService();
      
      // Setup sensor listeners
      SensorManager.getInstance().subscribe(this.handleSensorData.bind(this));
      
      // Reference listeners for voice commands, already active from existing system
      console.log('SecureDefenseSystem: Initialization complete');
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('SecureDefenseSystem: Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Start the security system monitoring
   */
  public async activate(): Promise<boolean> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) return false;
    }
    
    if (this.isActive) return true;
    
    try {
      console.log('SecureDefenseSystem: Activating security system');
      
      // Start all subsystems
      this.threatDetection?.startDetection(this.handleThreatDetection.bind(this));
      SensorManager.getInstance().startSensors();
      
      this.isActive = true;
      this.notifyListeners({
        isActive: true,
        emergencyMode: false,
        stealthMode: false,
        threat: null
      });
      
      return true;
    } catch (error) {
      console.error('SecureDefenseSystem: Failed to activate:', error);
      return false;
    }
  }

  /**
   * Stop the security system monitoring
   */
  public deactivate(): void {
    if (!this.isActive) return;
    
    console.log('SecureDefenseSystem: Deactivating security system');
    
    // Stop all monitoring systems
    this.threatDetection?.stopDetection();
    
    if (this.inEmergencyMode) {
      // Only stop recording if we're exiting the system completely
      this.recordingService?.stopRecording();
      this.stealthMode?.deactivate();
      this.inEmergencyMode = false;
    }
    
    this.isActive = false;
    this.notifyListeners({
      isActive: false,
      emergencyMode: false,
      stealthMode: false,
      threat: null
    });
  }

  /**
   * Handle threat detection events from ML models
   */
  private handleThreatDetection(detection: ThreatDetection | AIThreatDetection): void {
    if (!this.isActive) return;
    
    console.log('SecureDefenseSystem: Threat detection event:', detection);
    
    // Standard threat detection
    const isHighConfidence = detection.confidence > AUDIO_SENSITIVITY;
    const now = Date.now();
    const timeSinceLastCheck = now - this.lastThreatCheckTime;
    
    // Type guard for AIThreatDetection
    const isCriticalAIThreat = 'severity' in detection && 
      (detection.severity === 'critical' || detection.severity === 'high');
    
    // Reset threat counter after cooldown period to avoid accumulated false positives
    if (timeSinceLastCheck > this.threatCooldownPeriod) {
      this.possibleThreatCount = 0;
      this.consecutiveThreatDetections = 0;
    }
    
    let shouldTriggerEmergency = false;
    
    // Check threat type and severity
    if ('type' in detection && detection.type === 'weapon' && isHighConfidence) {
      // Weapon detection is critical - trigger immediately
      shouldTriggerEmergency = true;
      this.emergencyContext.type = 'violent_attack';
      this.emergencyContext.confidence = detection.confidence;
      this.emergencyContext.evidence.vision = true;
    } else if ('type' in detection && detection.type === 'struggle' && isHighConfidence) {
      // Physical struggle detected
      this.possibleThreatCount++;
      this.emergencyContext.evidence.vision = true;
      if (this.possibleThreatCount >= THREAT_CONFIRMATION_THRESHOLD) {
        shouldTriggerEmergency = true;
        this.emergencyContext.type = 'violent_attack';
        this.emergencyContext.confidence = detection.confidence;
      }
    } else if (isCriticalAIThreat) {
      // Critical threat from AI monitoring
      shouldTriggerEmergency = true;
      this.emergencyContext.type = 'subtype' in detection ? detection.subtype : 'unknown';
      this.emergencyContext.confidence = detection.confidence || 0.9;
    }
    
    if (shouldTriggerEmergency && !this.inEmergencyMode) {
      this.triggerEmergencyMode();
    }
    
    this.lastThreatCheckTime = now;
  }

  /**
   * Process sensor data for threat detection
   */
  private handleSensorData(data: SensorDataPoint | SensorDataPoint[]): void {
    if (!this.isActive || this.inEmergencyMode) return;
    
    // Convert single data point to array for consistent processing
    const dataPoints = Array.isArray(data) ? data : [data];
    
    // Check for sudden motion, which could indicate physical attack
    const accelerometerData = dataPoints.filter(point => point.type === 'accelerometer');
    if (accelerometerData.length > 0) {
      const hasViolentMotion = this.detectViolentMotion(accelerometerData);
      if (hasViolentMotion) {
        this.possibleThreatCount++;
        this.emergencyContext.evidence.motion = true;
        
        if (this.possibleThreatCount >= THREAT_CONFIRMATION_THRESHOLD) {
          this.triggerEmergencyMode();
        }
      }
    }
  }
  
  /**
   * Process voice commands for emergency triggers
   */
  public async processVoiceCommand(transcript: string, confidence: number): Promise<boolean> {
    if (!this.isActive) return false;
    
    const normalizedText = transcript.toLowerCase();
    
    // Check for safety trigger while in emergency mode
    if (this.inEmergencyMode) {
      if (normalizedText.includes('soteria i\'m safe') || 
          normalizedText.includes('all clear') || 
          normalizedText.includes('emergency over')) {
        console.log('SecureDefenseSystem: Safety phrase detected, deactivating emergency mode');
        this.disableEmergencyMode();
        return true;
      }
      return false;
    }
    
    // Check for emergency keywords
    const hasEmergencyKeyword = EMERGENCY_KEYWORDS.some(keyword => 
      normalizedText.includes(keyword)
    );
    
    if (hasEmergencyKeyword) {
      console.log('SecureDefenseSystem: Emergency keyword detected in voice command');
      this.possibleThreatCount++;
      this.emergencyContext.evidence.voice = true;
      
      // Analyze sentiment of the command for more context
      try {
        const sentiment = await deepgramService.analyzeSentiment(transcript);
        if (sentiment.urgency === 'high' || sentiment.sentiment === 'negative') {
          this.possibleThreatCount++;
        }
      } catch (error) {
        // If sentiment analysis fails, err on the side of caution
        this.possibleThreatCount++;
      }
      
      if (this.possibleThreatCount >= THREAT_CONFIRMATION_THRESHOLD) {
        this.emergencyContext.type = hasEmergencyKeyword ? 'violent_attack' : 'unknown_threat';
        this.emergencyContext.confidence = confidence;
        this.triggerEmergencyMode();
        return true;
      }
    }
    
    return false;
  }

  /**
   * Detect violent motion from accelerometer data
   */
  private detectViolentMotion(data: SensorDataPoint[]): boolean {
    // Implement a simple algorithm to detect sudden, violent movements
    // This would be refined with real sensor data and ML in production
    
    // Check for large changes in acceleration (possible struggle or attack)
    let maxMagnitude = 0;
    let minMagnitude = 100;
    
    for (const point of data) {
      const magnitude = Math.sqrt(
        Math.pow(point.x, 2) + 
        Math.pow(point.y, 2) + 
        Math.pow(point.z, 2)
      );
      
      maxMagnitude = Math.max(maxMagnitude, magnitude);
      minMagnitude = Math.min(minMagnitude, magnitude);
    }
    
    // Large variation in a short time could indicate violent motion
    const variation = maxMagnitude - minMagnitude;
    return variation > MOTION_SENSITIVITY;
  }

  /**
   * Trigger emergency mode with different actions based on threat type
   */
  public triggerEmergencyMode(): void {
    if (this.inEmergencyMode) return;
    
    console.log('SecureDefenseSystem: EMERGENCY MODE ACTIVATED');
    this.inEmergencyMode = true;
    this.emergencyContext.status = 'emergency';
    this.emergencyContext.detectionTimestamp = Date.now();
    
    // Actions depend on the type of emergency
    if (this.isViolentAttack()) {
      // For violent attacks/kidnapping, activate full stealth protocol
      this.activateStealthProtocol();
    } else {
      // For other emergencies, just send alerts
      this.sendEmergencyAlerts();
    }
    
    // Notify system listeners
    this.notifyListeners({
      isActive: true,
      emergencyMode: true,
      stealthMode: this.isViolentAttack(),
      threat: {
        type: this.emergencyContext.type,
        confidence: this.emergencyContext.confidence,
        timestamp: this.emergencyContext.detectionTimestamp,
        evidence: this.emergencyContext.evidence
      }
    });
  }

  /**
   * Activate full stealth protocol for violent attacks
   */
  private activateStealthProtocol(): void {
    // 1. Activate stealth mode
    this.stealthMode?.activate();
    
    // 2. Start recording evidence
    this.recordingService?.startRecording();
    
    // 3. Send emergency alerts with attachments
    this.alertService?.sendEmergencyAlerts({
      emergency_type: 'violent_attack',
      location: this.getCurrentLocation(),
      timestamp: new Date().toISOString(),
      send_media: true,
      recipients: 'all', // Send to emergency contacts, police
      alert_method: 'all' // Try all available methods
    });
    
    // 4. Simulate incoming emergency call to deter attackers
    emergencyCallService.startEmergencyCall('weapon');
  }

  /**
   * Send emergency alerts for non-violent emergencies
   */
  private sendEmergencyAlerts(): void {
    let emergencyType = 'unknown';
    
    // Map our internal type to the alert service type
    if (this.emergencyContext.type === 'health') {
      emergencyType = 'medical';
    } else if (this.emergencyContext.type === 'fall') {
      emergencyType = 'medical';
    } else if (this.emergencyContext.type === 'weapon') {
      emergencyType = 'violent_attack';
    }
    
    this.alertService?.sendEmergencyAlerts({
      emergency_type: emergencyType,
      location: this.getCurrentLocation(),
      timestamp: new Date().toISOString(),
      send_media: false,
      recipients: emergencyType === 'medical' ? 'medical' : 'contacts',
      alert_method: 'sms' // Just SMS for non-violent emergencies
    });
  }

  /**
   * Disable emergency mode when it's safe
   */
  private disableEmergencyMode(): void {
    if (!this.inEmergencyMode) return;
    
    console.log('SecureDefenseSystem: Disabling emergency mode');
    
    // Stop recording
    this.recordingService?.stopRecording();
    
    // Deactivate stealth mode
    if (this.stealthMode?.isActive()) {
      this.stealthMode.deactivate();
    }
    
    // Reset state
    this.inEmergencyMode = false;
    this.emergencyContext.status = 'normal';
    this.possibleThreatCount = 0;
    this.consecutiveThreatDetections = 0;
    
    // Send all-clear notification
    this.alertService?.sendAllClearAlert();
    
    // Notify system listeners
    this.notifyListeners({
      isActive: true,
      emergencyMode: false,
      stealthMode: false,
      threat: null
    });
  }

  /**
   * Determine if the current emergency is a violent attack
   */
  private isViolentAttack(): boolean {
    const type = this.emergencyContext.type;
    return type === 'violent_attack' || 
           type === 'weapon' || 
           type === 'kidnapping';
  }

  /**
   * Get the current location for emergency alerts
   */
  private getCurrentLocation(): [number, number] {
    // In a real implementation, this would get the actual device location
    // For now, return a placeholder
    return [0, 0];
  }

  /**
   * Add listener for security system status changes
   */
  public addStatusListener(listener: (status: SecuritySystemStatus) => void): () => void {
    this.listeners.push(listener);
    
    // Immediately notify with current status
    listener({
      isActive: this.isActive,
      emergencyMode: this.inEmergencyMode,
      stealthMode: this.stealthMode?.isActive() || false,
      threat: this.inEmergencyMode ? {
        type: this.emergencyContext.type,
        confidence: this.emergencyContext.confidence,
        timestamp: this.emergencyContext.detectionTimestamp,
        evidence: this.emergencyContext.evidence
      } : null
    });
    
    // Return cleanup function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of status changes
   */
  private notifyListeners(status: SecuritySystemStatus): void {
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('SecureDefenseSystem: Error notifying listener:', error);
      }
    });
  }

  /**
   * Check if the security system is active
   */
  public isSecurityActive(): boolean {
    return this.isActive;
  }

  /**
   * Check if in emergency mode
   */
  public isInEmergency(): boolean {
    return this.inEmergencyMode;
  }
}

// Types for emergency context
interface EmergencyContext {
  type: string;
  confidence: number;
  evidence: {
    audio: boolean;
    motion: boolean;
    vision: boolean;
    voice: boolean;
  };
  detectionTimestamp: number;
  status: 'normal' | 'potential_threat' | 'emergency';
}

// Types for security system status
export interface SecuritySystemStatus {
  isActive: boolean;
  emergencyMode: boolean;
  stealthMode: boolean;
  threat: {
    type: string;
    confidence: number;
    timestamp: number;
    evidence: {
      audio: boolean;
      motion: boolean;
      vision: boolean;
      voice: boolean;
    };
  } | null;
}

// Export singleton instance
const secureDefenseSystem = new SecureDefenseSystem();
export default secureDefenseSystem;

// React hook for consuming the security system status
export function useSecureDefense() {
  const [status, setStatus] = useState<SecuritySystemStatus>({
    isActive: false,
    emergencyMode: false,
    stealthMode: false,
    threat: null
  });

  useEffect(() => {
    // Initialize on mount
    secureDefenseSystem.initialize();
    
    // Subscribe to status updates
    const unsubscribe = secureDefenseSystem.addStatusListener(setStatus);
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Actions that can be performed
  const activateSecurity = async () => {
    return await secureDefenseSystem.activate();
  };

  const deactivateSecurity = () => {
    secureDefenseSystem.deactivate();
  };

  const triggerEmergency = () => {
    secureDefenseSystem.triggerEmergencyMode();
  };

  return {
    status,
    activateSecurity,
    deactivateSecurity,
    triggerEmergency,
    isActive: status.isActive,
    isEmergency: status.emergencyMode
  };
}
