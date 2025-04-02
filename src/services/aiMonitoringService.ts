
import { HealthReading, AIThreatDetection, AIMonitoringSettings, HealthReadingType } from '@/types/ai-monitoring';

class AIMonitoringService {
  private settings: AIMonitoringSettings = {
    enabled: true,
    healthMonitoring: true,
    environmentalMonitoring: true,
    securityMonitoring: true,
    autoResponseLevel: 'assist',
    emergencyContactsToNotify: [],
  };

  private listeners: ((detection: AIThreatDetection) => void)[] = [];
  private simulationInterval: NodeJS.Timeout | null = null;
  private isSimulating: boolean = false;

  constructor() {
    // Initialize with default settings
    this.loadSettings();
  }

  private loadSettings(): void {
    try {
      const savedSettings = localStorage.getItem('ai-monitoring-settings');
      if (savedSettings) {
        this.settings = JSON.parse(savedSettings);
      }
    } catch (error) {
      console.error('Error loading AI monitoring settings:', error);
    }
  }

  public saveSettings(settings: Partial<AIMonitoringSettings>): void {
    this.settings = { ...this.settings, ...settings };
    localStorage.setItem('ai-monitoring-settings', JSON.stringify(this.settings));
  }

  public getSettings(): AIMonitoringSettings {
    return { ...this.settings };
  }

  public startMonitoring(): void {
    if (!this.settings.enabled) return;
    console.log('AI Monitoring service started');
    
    // In a real app, this would connect to device sensors
    // For demo purposes, we'll simulate readings
    this.startSimulation();
  }

  public stopMonitoring(): void {
    console.log('AI Monitoring service stopped');
    this.stopSimulation();
  }

  public addEventListener(callback: (detection: AIThreatDetection) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners(detection: AIThreatDetection): void {
    this.listeners.forEach(listener => listener(detection));
  }

  // Simulates sensor readings for demonstration purposes
  private startSimulation(): void {
    if (this.isSimulating) return;
    
    this.isSimulating = true;
    this.simulationInterval = setInterval(() => {
      // Randomly trigger different types of readings
      const readingTypes: HealthReadingType[] = ['heartbeat', 'temperature', 'breathing', 'environment'];
      const randomType = readingTypes[Math.floor(Math.random() * readingTypes.length)];
      
      const reading = this.generateRandomReading(randomType);
      this.processReading(reading);
      
    }, 10000); // Generate a reading every 10 seconds
  }

  private stopSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    this.isSimulating = false;
  }

  private generateRandomReading(type: HealthReadingType): HealthReading {
    let value = 0;
    let status: 'normal' | 'warning' | 'critical' = 'normal';
    
    // Generate realistic values for different reading types
    switch (type) {
      case 'heartbeat':
        // Normal resting heart rate: 60-100 bpm
        value = Math.floor(Math.random() * 60) + 60;
        // Randomly make it abnormal sometimes for demo
        if (Math.random() < 0.05) value = Math.floor(Math.random() * 40) + 120;
        status = value < 50 || value > 120 ? 'critical' : 
                value < 60 || value > 100 ? 'warning' : 'normal';
        break;
      
      case 'temperature':
        // Normal body temperature: ~98.6°F (37°C)
        value = 98.6 + (Math.random() * 3 - 1.5);
        status = value < 95 || value > 103 ? 'critical' : 
                value < 97 || value > 100 ? 'warning' : 'normal';
        break;
      
      case 'breathing':
        // Normal breathing rate: 12-20 breaths per minute
        value = Math.floor(Math.random() * 10) + 12;
        // Randomly make it abnormal sometimes for demo
        if (Math.random() < 0.05) value = Math.floor(Math.random() * 10) + 25;
        status = value < 8 || value > 30 ? 'critical' : 
                value < 12 || value > 25 ? 'warning' : 'normal';
        break;
      
      case 'environment':
        // Environment "danger level" from 0-100
        value = Math.floor(Math.random() * 100);
        // Randomly make it dangerous sometimes for demo
        if (Math.random() < 0.05) value = Math.floor(Math.random() * 30) + 70;
        status = value > 80 ? 'critical' : 
                value > 50 ? 'warning' : 'normal';
        break;
      
      default:
        value = Math.random() * 100;
        status = 'normal';
    }
    
    return {
      id: Date.now().toString(),
      type,
      value,
      timestamp: new Date().toISOString(),
      status
    };
  }

  private processReading(reading: HealthReading): void {
    console.log('Processing reading:', reading);
    
    // Only process abnormal readings
    if (reading.status === 'normal') return;
    
    let detectionType: 'health' | 'environment' | 'security';
    let subtype: string;
    let severity: 'low' | 'medium' | 'high' | 'critical';
    let description: string;
    let recommendedAction: string;
    let automaticResponseTaken: string | null = null;
    
    // Map reading type to detection properties
    switch (reading.type) {
      case 'heartbeat':
        detectionType = 'health';
        subtype = 'heart-rate';
        severity = reading.status === 'critical' ? 'critical' : 'medium';
        description = reading.value < 60 
          ? `Abnormally low heart rate detected (${reading.value} bpm)` 
          : `Abnormally high heart rate detected (${reading.value} bpm)`;
        recommendedAction = reading.status === 'critical'
          ? 'Seek immediate medical attention'
          : 'Rest and monitor heart rate';
        break;
        
      case 'temperature':
        detectionType = 'health';
        subtype = 'body-temperature';
        severity = reading.status === 'critical' ? 'critical' : 'medium';
        description = reading.value < 97 
          ? `Low body temperature detected (${reading.value.toFixed(1)}°F)` 
          : `High body temperature detected (${reading.value.toFixed(1)}°F)`;
        recommendedAction = reading.status === 'critical'
          ? 'Seek immediate medical attention'
          : 'Rest and monitor temperature';
        break;
        
      case 'breathing':
        detectionType = 'health';
        subtype = 'respiratory-rate';
        severity = reading.status === 'critical' ? 'critical' : 'medium';
        description = reading.value < 12 
          ? `Slow breathing rate detected (${reading.value} breaths/min)` 
          : `Rapid breathing rate detected (${reading.value} breaths/min)`;
        recommendedAction = reading.status === 'critical'
          ? 'Seek immediate medical attention'
          : 'Practice controlled breathing and monitor';
        break;
        
      case 'environment':
        detectionType = 'environment';
        subtype = reading.value > 80 ? 'immediate-danger' : 'potential-hazard';
        severity = reading.status === 'critical' ? 'high' : 'medium';
        description = `Environmental hazard detected (level ${reading.value})`;
        recommendedAction = reading.status === 'critical'
          ? 'Evacuate the area immediately'
          : 'Be cautious and prepare to evacuate if conditions worsen';
        break;
        
      default:
        detectionType = 'security';
        subtype = 'unknown';
        severity = 'medium';
        description = `Unusual reading detected (${reading.type}: ${reading.value})`;
        recommendedAction = 'Monitor the situation';
    }
    
    // Take automatic action based on settings
    if (this.settings.autoResponseLevel !== 'none' && reading.status === 'critical') {
      if (this.settings.autoResponseLevel === 'full') {
        // Simulate calling emergency services in full auto mode
        automaticResponseTaken = 'Emergency services automatically notified';
      } else if (this.settings.autoResponseLevel === 'assist') {
        // Simulate prepping emergency call
        automaticResponseTaken = 'Emergency call prepared - waiting for confirmation';
      } else if (this.settings.autoResponseLevel === 'notify') {
        // Just notify
        automaticResponseTaken = 'Emergency contacts notified of potential emergency';
      }
    }
    
    // Create the threat detection
    const detection: AIThreatDetection = {
      id: Date.now().toString(),
      type: detectionType,
      subtype,
      severity,
      description,
      recommendedAction,
      automaticResponseTaken,
      timestamp: new Date().toISOString(),
      rawData: reading
    };
    
    // Notify all listeners
    this.notifyListeners(detection);
  }
}

// Create a singleton instance
export const aiMonitoringService = new AIMonitoringService();

export default aiMonitoringService;
