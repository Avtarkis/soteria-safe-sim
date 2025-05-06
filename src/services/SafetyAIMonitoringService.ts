
import { useState, useEffect, useCallback } from 'react';
import ModelManager from '@/utils/ml/ModelManager';
import PoseDetectionService from '@/utils/ml/PoseDetectionService';
import AudioThreatDetectionService from '@/utils/ml/AudioThreatDetection';
import HealthMonitorService from '@/utils/ml/HealthMonitorService';
import SensorManager from '@/utils/sensors/SensorManager';
import EmergencyResponseSystem from '@/utils/emergency/EmergencyResponseSystem';

export interface MonitoringStatus {
  active: boolean;
  detectionModes: {
    pose: boolean;
    audio: boolean;
    health: boolean;
  };
  lastEvents: {
    pose: { timestamp: number, details: string } | null;
    audio: { timestamp: number, details: string } | null;
    health: { timestamp: number, details: string } | null;
  };
}

class SafetyAIMonitoringService {
  private static instance: SafetyAIMonitoringService;
  private initialized = false;
  private active = false;
  private status: MonitoringStatus;
  private videoElement: HTMLVideoElement | null = null;
  private statusListeners: Array<(status: MonitoringStatus) => void> = [];
  private sensorDataHandler: ((data: any) => void) | null = null;
  
  private constructor() {
    this.status = {
      active: false,
      detectionModes: {
        pose: false,
        audio: false,
        health: false
      },
      lastEvents: {
        pose: null,
        audio: null,
        health: null
      }
    };
  }
  
  public static getInstance(): SafetyAIMonitoringService {
    if (!SafetyAIMonitoringService.instance) {
      SafetyAIMonitoringService.instance = new SafetyAIMonitoringService();
    }
    return SafetyAIMonitoringService.instance;
  }
  
  public async initialize(): Promise<boolean> {
    if (this.initialized) return true;
    
    console.log('AI Monitoring service started');
    
    try {
      // Initialize TensorFlow and models
      await ModelManager.loadModel(
        'pose',
        'movenet',
        'https://tfhub.dev/google/tfjs-model/movenet/singlepose/lightning/4'
      );
      
      // Initialize emergency response system
      EmergencyResponseSystem.activate();
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize SafetyAI monitoring service:', error);
      return false;
    }
  }
  
  public async startMonitoring(options: { 
    poseDetection?: boolean,
    audioDetection?: boolean,
    healthMonitoring?: boolean,
    videoElement?: HTMLVideoElement
  } = {}): Promise<boolean> {
    if (!this.initialized) {
      const initialized = await this.initialize();
      if (!initialized) return false;
    }
    
    if (this.active) return true;
    
    const { 
      poseDetection = true, 
      audioDetection = true,
      healthMonitoring = true,
      videoElement = null 
    } = options;
    
    try {
      this.videoElement = videoElement;
      this.active = true;
      
      // Start sensor collection
      SensorManager.startSensors();
      
      // Set up sensor data handler
      this.sensorDataHandler = (data) => {
        if (healthMonitoring && this.active) {
          HealthMonitorService.processSensorData(data);
        }
      };
      
      // Subscribe to sensor data
      SensorManager.subscribe(this.sensorDataHandler);
      
      // Start health monitoring if requested
      if (healthMonitoring) {
        await this.setupHealthMonitoring();
      }
      
      // Start audio detection if requested
      if (audioDetection) {
        await this.setupAudioDetection();
      }
      
      // Start pose detection if requested and video element is available
      if (poseDetection && videoElement) {
        await this.setupPoseDetection(videoElement);
      }
      
      this.updateStatus({
        active: true,
        detectionModes: {
          pose: poseDetection,
          audio: audioDetection,
          health: healthMonitoring
        }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to start monitoring:', error);
      this.stopMonitoring();
      return false;
    }
  }
  
  public stopMonitoring(): void {
    if (!this.active) return;
    
    // Stop all monitoring services
    PoseDetectionService.stopDetection();
    AudioThreatDetectionService.stopDetection();
    HealthMonitorService.stopMonitoring();
    
    // Unsubscribe from sensor data
    if (this.sensorDataHandler) {
      SensorManager.unsubscribe(this.sensorDataHandler);
      this.sensorDataHandler = null;
    }
    
    // Stop sensors
    SensorManager.stopSensors();
    
    this.active = false;
    this.updateStatus({
      active: false,
      detectionModes: {
        pose: false,
        audio: false,
        health: false
      }
    });
  }
  
  private async setupPoseDetection(videoElement: HTMLVideoElement): Promise<boolean> {
    try {
      // Initialize pose detection service
      await PoseDetectionService.initialize();
      
      // Start detection
      return await PoseDetectionService.startDetection(
        videoElement,
        (result) => {
          // Handle pose detection results
          if (result.threats.length > 0) {
            // Update last event
            this.updateStatus({
              lastEvents: {
                ...this.status.lastEvents,
                pose: {
                  timestamp: result.timestamp,
                  details: result.threats[0].details || 'Potential threat detected'
                }
              }
            });
            
            // Forward threats to emergency response system
            result.threats.forEach(threat => {
              EmergencyResponseSystem.handleThreatDetection(threat);
            });
          }
        }
      );
    } catch (error) {
      console.error('Failed to set up pose detection:', error);
      return false;
    }
  }
  
  private async setupAudioDetection(): Promise<boolean> {
    try {
      // Initialize audio threat detection
      await AudioThreatDetectionService.initialize();
      
      // Start detection
      return await AudioThreatDetectionService.startDetection(
        (result) => {
          // Handle audio threat detection
          if (result.detected) {
            // Update last event
            this.updateStatus({
              lastEvents: {
                ...this.status.lastEvents,
                audio: {
                  timestamp: result.timestamp,
                  details: `Detected ${result.type} sound`
                }
              }
            });
            
            // Forward to emergency response system
            EmergencyResponseSystem.handleAudioThreat(result);
          }
        }
      );
    } catch (error) {
      console.error('Failed to set up audio detection:', error);
      return false;
    }
  }
  
  private async setupHealthMonitoring(): Promise<boolean> {
    try {
      // Initialize health monitoring
      await HealthMonitorService.initialize();
      
      // Start monitoring
      return HealthMonitorService.startMonitoring(
        (event) => {
          // Handle health events
          if (event.type !== 'normal') {
            // Update last event
            this.updateStatus({
              lastEvents: {
                ...this.status.lastEvents,
                health: {
                  timestamp: event.timestamp,
                  details: event.details || `Health issue detected: ${event.type}`
                }
              }
            });
            
            // Forward to emergency response system
            EmergencyResponseSystem.handleHealthEvent(event);
          }
        }
      );
    } catch (error) {
      console.error('Failed to set up health monitoring:', error);
      return false;
    }
  }
  
  private updateStatus(updates: Partial<MonitoringStatus>): void {
    this.status = {
      ...this.status,
      ...updates
    };
    
    // Notify all listeners
    this.statusListeners.forEach(listener => {
      try {
        listener(this.status);
      } catch (e) {
        console.error('Error in monitoring status listener:', e);
      }
    });
  }
  
  public getStatus(): MonitoringStatus {
    return { ...this.status };
  }
  
  public registerStatusListener(listener: (status: MonitoringStatus) => void): () => void {
    this.statusListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.statusListeners.indexOf(listener);
      if (index !== -1) {
        this.statusListeners.splice(index, 1);
      }
    };
  }
  
  public isActive(): boolean {
    return this.active;
  }
  
  public handleVoiceCommand(command: string, confidence: number): void {
    if (!this.active) return;
    
    // Check for emergency keywords
    const emergencyKeywords = [
      'help', 'emergency', 'danger', 'threat', 
      'scared', 'afraid', 'weapon', 'gun', 'knife',
      'fall', 'fell', 'hurt', 'injury', 'pain',
      'sick', 'dizzy', 'faint'
    ];
    
    // Check if command contains emergency keywords
    const isEmergency = emergencyKeywords.some(keyword => 
      command.toLowerCase().includes(keyword)
    );
    
    if (isEmergency) {
      EmergencyResponseSystem.handleVoiceTrigger(command, confidence);
    }
  }
  
  public processEnvironmentReading(reading: any): void {
    if (!this.active) return;
    
    // Process data from external sources
    SensorManager.processEnvironmentReading(reading);
  }
}

// Create singleton instance
const instance = SafetyAIMonitoringService.getInstance();

// Hook for using the SafetyAI monitoring service
export function useSafetyAIMonitoring() {
  const [status, setStatus] = useState<MonitoringStatus>({
    active: false,
    detectionModes: {
      pose: false,
      audio: false,
      health: false
    },
    lastEvents: {
      pose: null,
      audio: null,
      health: null
    }
  });
  
  const [emergencyActive, setEmergencyActive] = useState<boolean>(false);
  
  const safetyAI = instance;
  
  // Initialize the service
  useEffect(() => {
    safetyAI.initialize();
    
    // Check emergency status
    const checkEmergency = () => {
      const isActive = EmergencyResponseSystem.isEmergencyActive();
      setEmergencyActive(isActive);
    };
    
    // Listen for emergency status changes
    document.addEventListener('emergencyStatusChanged', checkEmergency);
    
    return () => {
      document.removeEventListener('emergencyStatusChanged', checkEmergency);
    };
  }, []);
  
  // Listen for status changes
  useEffect(() => {
    const unsubscribe = safetyAI.registerStatusListener(newStatus => {
      setStatus(newStatus);
    });
    
    return unsubscribe;
  }, []);
  
  // Start monitoring
  const startMonitoring = useCallback(async (options = {}) => {
    return await safetyAI.startMonitoring(options);
  }, []);
  
  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    safetyAI.stopMonitoring();
  }, []);
  
  // Process voice command
  const processVoiceCommand = useCallback((command: string, confidence: number) => {
    safetyAI.handleVoiceCommand(command, confidence);
  }, []);
  
  return {
    status,
    emergencyActive,
    startMonitoring,
    stopMonitoring,
    processVoiceCommand
  };
}

export default instance;
