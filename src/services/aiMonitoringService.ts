import { AIThreatDetection, AIMonitoringSettings } from '@/types/ai-monitoring';
import { ThreatDetectionService } from './ThreatDetectionService';
import EmergencyResponseSystem from '@/utils/emergency/EmergencyResponseSystem';

type DetectionListener = (detection: AIThreatDetection) => void;

class AIMonitoringService {
  private settings: AIMonitoringSettings;
  private listeners: DetectionListener[] = [];
  private isMonitoring = false;
  private threatDetectionService: ThreatDetectionService;
  private detectionHistory: AIThreatDetection[] = [];

  constructor() {
    this.settings = {
      enabled: false,
      healthMonitoring: true,
      environmentalMonitoring: true,
      securityMonitoring: true,
      autoResponseLevel: 'assist',
      emergencyContactsToNotify: []
    };
    
    this.threatDetectionService = new ThreatDetectionService();
    this.loadSettings();
  }

  public getSettings(): AIMonitoringSettings {
    return { ...this.settings };
  }

  public saveSettings(newSettings: AIMonitoringSettings): void {
    this.settings = { ...newSettings };
    localStorage.setItem('aiMonitoringSettings', JSON.stringify(this.settings));
    
    // Restart monitoring with new settings if enabled
    if (this.isMonitoring) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }

  private loadSettings(): void {
    try {
      const stored = localStorage.getItem('aiMonitoringSettings');
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load AI monitoring settings:', error);
    }
  }

  public async startMonitoring(): Promise<boolean> {
    if (this.isMonitoring || !this.settings.enabled) {
      return false;
    }

    try {
      // Initialize threat detection service
      const initialized = await this.threatDetectionService.initialize();
      if (!initialized) {
        console.error('Failed to initialize threat detection service');
        return false;
      }

      // Start threat detection with callback
      const started = await this.threatDetectionService.startDetection((detection) => {
        this.handleThreatDetection(detection);
      });

      if (started) {
        this.isMonitoring = true;
        console.log('AI monitoring service started');
        return true;
      } else {
        console.error('Failed to start threat detection');
        return false;
      }
    } catch (error) {
      console.error('Error starting AI monitoring:', error);
      return false;
    }
  }

  public stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.threatDetectionService.stopDetection();
    this.isMonitoring = false;
    console.log('AI monitoring service stopped');
  }

  public setVideoSource(videoElement: HTMLVideoElement): void {
    this.threatDetectionService.setVideoSource(videoElement);
  }

  private handleThreatDetection(detection: any): void {
    // Convert detection to AIThreatDetection format
    const aiDetection: AIThreatDetection = {
      id: `detection-${Date.now()}`,
      type: this.mapDetectionType(detection.type),
      subtype: detection.type,
      severity: this.mapSeverityLevel(detection.confidence),
      confidence: detection.confidence || 0.8,
      description: detection.details || `${detection.type} detected`,
      recommendedAction: this.getRecommendedAction(detection.type),
      automaticResponseTaken: null,
      timestamp: Date.now(),
      details: detection.details || '',
      source: 'ai-monitoring'
    };

    // Add to detection history
    this.detectionHistory.push(aiDetection);
    if (this.detectionHistory.length > 100) {
      this.detectionHistory.shift(); // Keep only last 100 detections
    }

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(aiDetection);
      } catch (error) {
        console.error('Error in detection listener:', error);
      }
    });

    // Handle automatic response based on settings
    this.handleAutomaticResponse(aiDetection);
  }

  private mapDetectionType(detectionType: string): 'health' | 'security' | 'environment' {
    if (detectionType === 'fall' || detectionType === 'medical') {
      return 'health';
    } else if (detectionType === 'weapon' || detectionType === 'struggle') {
      return 'security';
    } else {
      return 'environment';
    }
  }

  private mapSeverityLevel(confidence: number): 'low' | 'medium' | 'high' | 'critical' {
    if (confidence >= 0.9) return 'critical';
    if (confidence >= 0.75) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  }

  private getRecommendedAction(detectionType: string): string {
    switch (detectionType) {
      case 'weapon':
        return 'Immediately contact emergency services and move to safety';
      case 'fall':
        return 'Check for injuries and call medical assistance if needed';
      case 'struggle':
        return 'Assess situation and contact appropriate authorities';
      default:
        return 'Monitor situation and take appropriate precautions';
    }
  }

  private handleAutomaticResponse(detection: AIThreatDetection): void {
    const { autoResponseLevel } = this.settings;
    
    if (autoResponseLevel === 'none') return;

    // Notify emergency response system with the detection object
    if (detection.type && detection.confidence) {
      // Map the detection subtype to a valid threat detection type
      const validSubtypes: ('fall' | 'weapon' | 'struggle' | 'unknown')[] = ['fall', 'weapon', 'struggle', 'unknown'];
      const mappedSubtype = validSubtypes.includes(detection.subtype as any) 
        ? detection.subtype as 'fall' | 'weapon' | 'struggle' | 'unknown'
        : 'unknown';

      EmergencyResponseSystem.handleThreatDetection({
        type: mappedSubtype,
        confidence: detection.confidence,
        details: detection.description || detection.details || 'AI threat detected'
      });
    }

    // Set automatic response taken
    if (autoResponseLevel === 'full' && (detection.severity === 'high' || detection.severity === 'critical')) {
      detection.automaticResponseTaken = 'Emergency protocols activated automatically';
    } else if (autoResponseLevel === 'assist') {
      detection.automaticResponseTaken = 'User notified, manual action required';
    } else {
      detection.automaticResponseTaken = 'Detection logged, no automatic action taken';
    }
  }

  public addEventListener(listener: DetectionListener): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public getDetectionHistory(): AIThreatDetection[] {
    return [...this.detectionHistory];
  }

  public isActive(): boolean {
    return this.isMonitoring;
  }
}

// Export singleton instance
export const aiMonitoringService = new AIMonitoringService();
export default aiMonitoringService;
