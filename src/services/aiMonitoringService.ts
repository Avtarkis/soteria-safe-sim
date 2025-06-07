
import { AIThreatDetection, AIMonitoringSettings } from '@/types/ai-monitoring';
import { ThreatDetectionService } from './ThreatDetectionService';
import { AIDetectionHandler } from './ai-monitoring/AIDetectionHandler';

type DetectionListener = (detection: AIThreatDetection) => void;

class AIMonitoringService {
  private settings: AIMonitoringSettings;
  private listeners: DetectionListener[] = [];
  private isMonitoring = false;
  private threatDetectionService: ThreatDetectionService;
  private detectionHistory: AIThreatDetection[] = [];
  private detectionHandler: AIDetectionHandler;

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
    this.detectionHandler = new AIDetectionHandler();
    this.loadSettings();
  }

  public getSettings(): AIMonitoringSettings {
    return { ...this.settings };
  }

  public saveSettings(newSettings: AIMonitoringSettings): void {
    this.settings = { ...newSettings };
    localStorage.setItem('aiMonitoringSettings', JSON.stringify(this.settings));
    
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
      const initialized = await this.threatDetectionService.initialize();
      if (!initialized) {
        console.error('Failed to initialize threat detection service');
        return false;
      }

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
    const aiDetection: AIThreatDetection = {
      id: `detection-${Date.now()}`,
      type: this.detectionHandler.mapDetectionType(detection.type),
      subtype: detection.type,
      severity: this.detectionHandler.mapSeverityLevel(detection.confidence),
      confidence: detection.confidence || 0.8,
      description: detection.details || `${detection.type} detected`,
      recommendedAction: this.detectionHandler.getRecommendedAction(detection.type),
      automaticResponseTaken: null,
      timestamp: Date.now(),
      details: detection.details || '',
      source: 'ai-monitoring'
    };

    this.detectionHistory.push(aiDetection);
    if (this.detectionHistory.length > 100) {
      this.detectionHistory.shift();
    }

    this.listeners.forEach(listener => {
      try {
        listener(aiDetection);
      } catch (error) {
        console.error('Error in detection listener:', error);
      }
    });

    this.detectionHandler.handleAutomaticResponse(aiDetection, this.settings.autoResponseLevel);
  }

  public addEventListener(listener: DetectionListener): () => void {
    this.listeners.push(listener);
    
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

export const aiMonitoringService = new AIMonitoringService();
export default aiMonitoringService;
