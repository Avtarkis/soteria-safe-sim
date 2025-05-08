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
  private lastDetections: Map<string, number> = new Map(); // To prevent duplicate alerts
  private vitalSignsHistory: Map<HealthReadingType, number[]> = new Map();
  private environmentalReadingsHistory: Map<string, number[]> = new Map();

  constructor() {
    // Initialize with default settings
    this.loadSettings();
    this.initializeHistories();
  }

  private initializeHistories() {
    // Initialize vital signs history for trend analysis
    this.vitalSignsHistory.set('heartbeat', []);
    this.vitalSignsHistory.set('temperature', []);
    this.vitalSignsHistory.set('breathing', []);
    
    // Initialize environmental readings
    this.environmentalReadingsHistory.set('airQuality', []);
    this.environmentalReadingsHistory.set('co2Level', []);
    this.environmentalReadingsHistory.set('radiationLevel', []);
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
    
    // Update monitoring based on new settings
    if (this.settings.enabled) {
      this.startMonitoring();
    } else {
      this.stopMonitoring();
    }
  }

  public getSettings(): AIMonitoringSettings {
    return { ...this.settings };
  }

  public startMonitoring(): void {
    if (!this.settings.enabled) return;
    console.log('AI Monitoring service started');
    
    // In a real app, this would connect to device sensors
    // For demo purposes, we'll create realistic simulations
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
    // Don't send duplicate notifications within 5 minutes
    const key = `${detection.type}-${detection.subtype}`;
    const now = Date.now();
    const lastTime = this.lastDetections.get(key) || 0;
    
    if (now - lastTime > 5 * 60 * 1000 || detection.severity === 'critical') {
      this.lastDetections.set(key, now);
      this.listeners.forEach(listener => listener(detection));
    }
  }

  // Simulates sensor readings with realistic patterns
  private startSimulation(): void {
    if (this.isSimulating) return;
    
    this.isSimulating = true;
    
    // Generate a health reading every 30-60 seconds
    const generateHealthReading = () => {
      if (!this.settings.healthMonitoring) return;
      
      const readingTypes: HealthReadingType[] = ['heartbeat', 'temperature', 'breathing'];
      const randomType = readingTypes[Math.floor(Math.random() * readingTypes.length)];
      
      const reading = this.generateRealisticReading(randomType);
      this.processReading(reading);
      
      // Schedule next health reading
      setTimeout(generateHealthReading, 30000 + Math.random() * 30000);
    };
    
    // Generate an environmental reading every 1-2 minutes
    const generateEnvironmentalReading = () => {
      if (!this.settings.environmentalMonitoring) return;
      
      const reading = this.generateRealisticReading('environment');
      this.processReading(reading);
      
      // Schedule next environmental reading
      setTimeout(generateEnvironmentalReading, 60000 + Math.random() * 60000);
    };
    
    // Generate security alerts occasionally
    const generateSecurityAlert = () => {
      if (!this.settings.securityMonitoring) return;
      
      if (Math.random() < 0.3) { // 30% chance of a security alert
        this.generateSecurityDetection();
      }
      
      // Schedule next security check
      setTimeout(generateSecurityAlert, 120000 + Math.random() * 180000);
    };
    
    // Start the simulation cycles
    generateHealthReading();
    generateEnvironmentalReading();
    generateSecurityAlert();
    
    // Perform trend analysis every 10 minutes
    this.simulationInterval = setInterval(() => {
      this.performTrendAnalysis();
    }, 10 * 60 * 1000);
  }

  private stopSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    this.isSimulating = false;
  }

  private generateRealisticReading(type: HealthReadingType): HealthReading {
    let value = 0;
    let status: 'normal' | 'warning' | 'critical' = 'normal';
    
    // Generate realistic values with slight variations from last reading
    switch (type) {
      case 'heartbeat': {
        const history = this.vitalSignsHistory.get('heartbeat') || [];
        const lastValue = history.length > 0 ? history[history.length - 1] : 75;
        
        // Normal resting heart rate: 60-100 bpm with small variations
        value = lastValue + (Math.random() * 6 - 3);
        
        // Occasionally generate abnormal readings
        if (Math.random() < 0.05) {
          if (Math.random() < 0.5) {
            // High heart rate
            value = 120 + Math.random() * 40;
          } else {
            // Low heart rate
            value = 40 + Math.random() * 15;
          }
        }
        
        status = value < 50 || value > 120 ? 'critical' : 
                value < 60 || value > 100 ? 'warning' : 'normal';
                
        // Store in history
        history.push(value);
        if (history.length > 20) history.shift();
        this.vitalSignsHistory.set('heartbeat', history);
        break;
      }
      
      case 'temperature': {
        const history = this.vitalSignsHistory.get('temperature') || [];
        const lastValue = history.length > 0 ? history[history.length - 1] : 98.6;
        
        // Normal body temperature with small variations
        value = lastValue + (Math.random() * 0.4 - 0.2);
        
        // Occasionally generate abnormal readings
        if (Math.random() < 0.05) {
          if (Math.random() < 0.7) {
            // Fever
            value = 100.5 + Math.random() * 3;
          } else {
            // Hypothermia
            value = 94 + Math.random() * 2;
          }
        }
        
        status = value < 95 || value > 103 ? 'critical' : 
                value < 97 || value > 100 ? 'warning' : 'normal';
                
        // Store in history
        history.push(value);
        if (history.length > 20) history.shift();
        this.vitalSignsHistory.set('temperature', history);
        break;
      }
      
      case 'breathing': {
        const history = this.vitalSignsHistory.get('breathing') || [];
        const lastValue = history.length > 0 ? history[history.length - 1] : 16;
        
        // Normal breathing rate with small variations
        value = lastValue + (Math.random() * 2 - 1);
        
        // Occasionally generate abnormal readings
        if (Math.random() < 0.05) {
          if (Math.random() < 0.6) {
            // Rapid breathing
            value = 26 + Math.random() * 10;
          } else {
            // Slow breathing
            value = 6 + Math.random() * 4;
          }
        }
        
        status = value < 8 || value > 30 ? 'critical' : 
                value < 12 || value > 25 ? 'warning' : 'normal';
                
        // Store in history
        history.push(value);
        if (history.length > 20) history.shift();
        this.vitalSignsHistory.set('breathing', history);
        break;
      }
      
      case 'environment': {
        // Randomly select an environmental factor
        const factors = ['airQuality', 'co2Level', 'radiationLevel'];
        const factor = factors[Math.floor(Math.random() * factors.length)];
        const history = this.environmentalReadingsHistory.get(factor) || [];
        
        // Get last value or default
        const lastValue = history.length > 0 ? history[history.length - 1] : 
                          factor === 'airQuality' ? 50 : 
                          factor === 'co2Level' ? 600 : 10;
        
        // Generate value with small variations
        if (factor === 'airQuality') {
          // Air quality index (0-500)
          value = Math.max(0, Math.min(500, lastValue + (Math.random() * 20 - 10)));
          status = value > 300 ? 'critical' : 
                  value > 150 ? 'warning' : 'normal';
        } else if (factor === 'co2Level') {
          // CO2 levels in ppm (normal ~400-1000)
          value = Math.max(400, Math.min(5000, lastValue + (Math.random() * 100 - 50)));
          status = value > 2000 ? 'critical' : 
                  value > 1000 ? 'warning' : 'normal';
        } else {
          // Radiation (baseline + variation)
          value = Math.max(5, Math.min(100, lastValue + (Math.random() * 5 - 2.5)));
          status = value > 50 ? 'critical' : 
                  value > 25 ? 'warning' : 'normal';
        }
        
        // Store in history
        history.push(value);
        if (history.length > 20) history.shift();
        this.environmentalReadingsHistory.set(factor, history);
        
        // Return with the appropriate custom type
        return {
          id: Date.now().toString(),
          type: 'environment' as HealthReadingType,
          value,
          timestamp: new Date().toISOString(),
          status,
          environmentType: factor
        } as any;
      }
      
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

  private generateSecurityDetection(): void {
    const securityEvents = [
      {
        type: 'security',
        subtype: 'unauthorized-access',
        severity: 'high',
        description: 'Unusual login attempt detected from an unrecognized location',
        recommendedAction: 'Verify account activity and change password immediately'
      },
      {
        type: 'security',
        subtype: 'suspicious-app',
        severity: 'medium',
        description: 'App attempting to access sensitive data in background',
        recommendedAction: 'Review app permissions and consider uninstalling'
      },
      {
        type: 'security',
        subtype: 'network-threat',
        severity: 'high',
        description: 'Connected to unsecured Wi-Fi network with potential eavesdropping risk',
        recommendedAction: 'Disconnect from network and use cellular data or VPN'
      },
      {
        type: 'security',
        subtype: 'data-breach',
        severity: 'critical',
        description: 'Your email was found in a recent data breach',
        recommendedAction: 'Change passwords for affected accounts and enable 2FA'
      }
    ];
    
    const event = securityEvents[Math.floor(Math.random() * securityEvents.length)];
    
    // Take automatic action based on settings
    let automaticResponseTaken: string | null = null;
    if (this.settings.autoResponseLevel !== 'none' && (event.severity === 'critical' || event.severity === 'high')) {
      if (this.settings.autoResponseLevel === 'full') {
        automaticResponseTaken = 'Security countermeasures automatically applied';
      } else if (this.settings.autoResponseLevel === 'assist') {
        automaticResponseTaken = 'Security tools prepared - waiting for confirmation';
      } else if (this.settings.autoResponseLevel === 'notify') {
        automaticResponseTaken = 'Emergency contacts notified of security threat';
      }
    }
    
    const detection: AIThreatDetection = {
      id: Date.now().toString(),
      type: event.type as 'health' | 'environment' | 'security',
      subtype: event.subtype,
      severity: event.severity as 'low' | 'medium' | 'high' | 'critical',
      description: event.description,
      recommendedAction: event.recommendedAction,
      automaticResponseTaken,
      timestamp: new Date().toISOString()
    };
    
    this.notifyListeners(detection);
  }

  private processReading(reading: HealthReading): void {
    // Skip normal readings most of the time to reduce noise
    if (reading.status === 'normal' && Math.random() > 0.1) return;
    
    console.log('Processing reading:', reading);
    
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
        severity = reading.status === 'critical' ? 'critical' : 
                  reading.status === 'warning' ? 'medium' : 'low';
                  
        if (reading.value < 50) {
          description = `Abnormally low heart rate detected (${Math.round(reading.value)} bpm)`;
          recommendedAction = severity === 'critical'
            ? 'Seek immediate medical attention - possible bradycardia'
            : 'Rest and monitor heart rate - contact doctor if symptoms persist';
        } else if (reading.value > 100) {
          description = `Elevated heart rate detected (${Math.round(reading.value)} bpm)`;
          recommendedAction = severity === 'critical'
            ? 'Seek immediate medical attention - possible tachycardia'
            : 'Rest, practice deep breathing, and monitor heart rate';
        } else {
          description = `Heart rate at ${Math.round(reading.value)} bpm`;
          recommendedAction = 'Continue normal activities';
          severity = 'low';
        }
        break;
        
      case 'temperature':
        detectionType = 'health';
        subtype = 'body-temperature';
        severity = reading.status === 'critical' ? 'critical' : 
                  reading.status === 'warning' ? 'medium' : 'low';
                  
        if (reading.value < 97) {
          description = `Low body temperature detected (${reading.value.toFixed(1)}°F)`;
          recommendedAction = severity === 'critical'
            ? 'Seek immediate medical attention - possible hypothermia'
            : 'Move to a warm environment and monitor temperature';
        } else if (reading.value > 100) {
          description = `Elevated body temperature detected (${reading.value.toFixed(1)}°F)`;
          recommendedAction = severity === 'critical'
            ? 'Seek immediate medical attention - possible severe fever'
            : 'Rest, stay hydrated, take fever reducer if needed';
        } else {
          description = `Body temperature at ${reading.value.toFixed(1)}°F`;
          recommendedAction = 'Continue normal activities';
          severity = 'low';
        }
        break;
        
      case 'breathing':
        detectionType = 'health';
        subtype = 'respiratory-rate';
        severity = reading.status === 'critical' ? 'critical' : 
                  reading.status === 'warning' ? 'medium' : 'low';
                  
        if (reading.value < 12) {
          description = `Slow breathing rate detected (${Math.round(reading.value)} breaths/min)`;
          recommendedAction = severity === 'critical'
            ? 'Seek immediate medical attention - possible respiratory depression'
            : 'Practice controlled breathing and monitor respiratory rate';
        } else if (reading.value > 25) {
          description = `Rapid breathing rate detected (${Math.round(reading.value)} breaths/min)`;
          recommendedAction = severity === 'critical'
            ? 'Seek immediate medical attention - possible respiratory distress'
            : 'Practice deep breathing exercises and monitor breathing rate';
        } else {
          description = `Breathing rate at ${Math.round(reading.value)} breaths/min`;
          recommendedAction = 'Continue normal activities';
          severity = 'low';
        }
        break;
        
      case 'environment':
        detectionType = 'environment';
        const envReading = reading as any;
        
        if (envReading.environmentType === 'airQuality') {
          subtype = 'air-quality';
          severity = reading.status === 'critical' ? 'high' : 
                    reading.status === 'warning' ? 'medium' : 'low';
          description = `Air quality index of ${Math.round(reading.value)} detected`;
          
          if (reading.value > 300) {
            recommendedAction = 'Hazardous air quality. Stay indoors, close windows, use air purifier';
          } else if (reading.value > 150) {
            recommendedAction = 'Unhealthy air quality. Limit outdoor activities';
          } else {
            recommendedAction = 'Air quality acceptable. No action needed';
          }
        } else if (envReading.environmentType === 'co2Level') {
          subtype = 'co2-levels';
          severity = reading.status === 'critical' ? 'high' : 
                    reading.status === 'warning' ? 'medium' : 'low';
          description = `CO2 level of ${Math.round(reading.value)} ppm detected`;
          
          if (reading.value > 2000) {
            recommendedAction = 'High CO2 levels. Ventilate area immediately';
          } else if (reading.value > 1000) {
            recommendedAction = 'Elevated CO2 levels. Increase ventilation';
          } else {
            recommendedAction = 'CO2 levels normal. No action needed';
          }
        } else {
          subtype = 'radiation-level';
          severity = reading.status === 'critical' ? 'critical' : 
                    reading.status === 'warning' ? 'high' : 'low';
          description = `Unusual radiation level of ${Math.round(reading.value)} μSv/h detected`;
          
          if (reading.value > 50) {
            recommendedAction = 'Dangerous radiation levels. Evacuate area immediately';
          } else if (reading.value > 25) {
            recommendedAction = 'Elevated radiation levels. Limit exposure time';
          } else {
            recommendedAction = 'Radiation levels acceptable. No action needed';
          }
        }
        break;
        
      default:
        detectionType = 'health';
        subtype = 'unknown';
        severity = 'medium';
        description = `Unusual reading detected (${reading.type}: ${reading.value})`;
        recommendedAction = 'Monitor the situation';
    }
    
    // Take automatic action based on settings for critical situations
    if (this.settings.autoResponseLevel !== 'none' && reading.status === 'critical') {
      if (this.settings.autoResponseLevel === 'full') {
        if (detectionType === 'health') {
          automaticResponseTaken = 'Emergency services automatically notified';
        } else if (detectionType === 'environment') {
          automaticResponseTaken = 'Emergency protocols automatically activated';
        }
      } else if (this.settings.autoResponseLevel === 'assist') {
        automaticResponseTaken = 'Emergency call prepared - waiting for confirmation';
      } else if (this.settings.autoResponseLevel === 'notify') {
        automaticResponseTaken = 'Emergency contacts notified of potential emergency';
      }
    }
    
    // Skip low severity events sometimes to reduce noise
    if (severity === 'low' && Math.random() > 0.3) return;
    
    // Create the threat detection
    const detection: AIThreatDetection = {
      id: Date.now().toString(),
      type: detectionType,
      subtype,
      severity,
      description,
      recommendedAction,
      automaticResponseTaken,
      timestamp: Date.now(), // Changed to number
      rawData: reading
    };
    
    // Notify all listeners
    this.notifyListeners(detection);
  }

  // Analyze trends in vital signs and environmental data to detect subtle issues
  private performTrendAnalysis(): void {
    // Analyze heart rate trends
    this.analyzeHeartRateTrends();
    
    // Analyze temperature trends
    this.analyzeTemperatureTrends();
    
    // Analyze breathing rate trends
    this.analyzeBreathingRateTrends();
    
    // Analyze environmental trends
    this.analyzeEnvironmentalTrends();
  }

  private analyzeHeartRateTrends(): void {
    const heartRates = this.vitalSignsHistory.get('heartbeat') || [];
    if (heartRates.length < 5) return;
    
    // Calculate trend (increasing, decreasing, or stable)
    const recentRates = heartRates.slice(-5);
    let increasing = true;
    let decreasing = true;
    
    for (let i = 1; i < recentRates.length; i++) {
      if (recentRates[i] <= recentRates[i-1]) increasing = false;
      if (recentRates[i] >= recentRates[i-1]) decreasing = false;
    }
    
    // Check for sustained high or low heart rate
    const avgRate = recentRates.reduce((sum, rate) => sum + rate, 0) / recentRates.length;
    
    if (increasing && avgRate > 90) {
      const detection: AIThreatDetection = {
        id: Date.now().toString(),
        type: 'health',
        subtype: 'heart-rate-trend',
        severity: 'medium',
        description: `Steadily increasing heart rate detected over time (now ${Math.round(avgRate)} bpm)`,
        recommendedAction: 'Rest and monitor heart rate pattern',
        automaticResponseTaken: null,
        timestamp: Date.now() // Changed to number
      };
      this.notifyListeners(detection);
    } else if (decreasing && avgRate < 60) {
      const detection: AIThreatDetection = {
        id: Date.now().toString(),
        type: 'health',
        subtype: 'heart-rate-trend',
        severity: 'medium',
        description: `Steadily decreasing heart rate detected over time (now ${Math.round(avgRate)} bpm)`,
        recommendedAction: 'Monitor heart rate and consult a healthcare provider',
        automaticResponseTaken: null,
        timestamp: Date.now() // Changed to number
      };
      this.notifyListeners(detection);
    }
  }

  private analyzeTemperatureTrends(): void {
    const temperatures = this.vitalSignsHistory.get('temperature') || [];
    if (temperatures.length < 5) return;
    
    // Calculate trend
    const recentTemps = temperatures.slice(-5);
    let increasing = true;
    let decreasing = true;
    
    for (let i = 1; i < recentTemps.length; i++) {
      if (recentTemps[i] <= recentTemps[i-1]) increasing = false;
      if (recentTemps[i] >= recentTemps[i-1]) decreasing = false;
    }
    
    const avgTemp = recentTemps.reduce((sum, temp) => sum + temp, 0) / recentTemps.length;
    
    if (increasing && avgTemp > 99.5) {
      const detection: AIThreatDetection = {
        id: Date.now().toString(),
        type: 'health',
        subtype: 'temperature-trend',
        severity: 'medium',
        description: `Body temperature steadily rising over time (now ${avgTemp.toFixed(1)}°F)`,
        recommendedAction: 'Monitor temperature, rest, and stay hydrated',
        automaticResponseTaken: null,
        timestamp: Date.now() // Changed to number
      };
      this.notifyListeners(detection);
    } else if (decreasing && avgTemp < 97) {
      const detection: AIThreatDetection = {
        id: Date.now().toString(),
        type: 'health',
        subtype: 'temperature-trend',
        severity: 'medium',
        description: `Body temperature steadily decreasing over time (now ${avgTemp.toFixed(1)}°F)`,
        recommendedAction: 'Move to warmer environment and monitor temperature',
        automaticResponseTaken: null,
        timestamp: Date.now() // Changed to number
      };
      this.notifyListeners(detection);
    }
  }

  private analyzeBreathingRateTrends(): void {
    const breathingRates = this.vitalSignsHistory.get('breathing') || [];
    if (breathingRates.length < 5) return;
    
    // Calculate variability (standard deviation)
    const recentRates = breathingRates.slice(-5);
    const avg = recentRates.reduce((sum, rate) => sum + rate, 0) / recentRates.length;
    const variance = recentRates.reduce((sum, rate) => sum + Math.pow(rate - avg, 2), 0) / recentRates.length;
    const stdDev = Math.sqrt(variance);
    
    // Check for unusually stable or erratic breathing
    if (stdDev < 0.5 && avg < 12) {
      const detection: AIThreatDetection = {
        id: Date.now().toString(),
        type: 'health',
        subtype: 'breathing-pattern',
        severity: 'medium',
        description: `Unusually regular, slow breathing pattern detected (${avg.toFixed(1)} breaths/min)`,
        recommendedAction: 'Monitor breathing pattern and oxygen levels',
        automaticResponseTaken: null,
        timestamp: Date.now() // Changed to number
      };
      this.notifyListeners(detection);
    } else if (stdDev > 4) {
      const detection: AIThreatDetection = {
        id: Date.now().toString(),
        type: 'health',
        subtype: 'breathing-pattern',
        severity: 'medium',
        description: 'Erratic breathing pattern detected',
        recommendedAction: 'Practice controlled breathing exercises and monitor pattern',
        automaticResponseTaken: null,
        timestamp: Date.now() // Changed to number
      };
      this.notifyListeners(detection);
    }
  }

  private analyzeEnvironmentalTrends(): void {
    // Check for worsening air quality
    const airQuality = this.environmentalReadingsHistory.get('airQuality') || [];
    if (airQuality.length >= 5) {
      const recentAQ = airQuality.slice(-5);
      let worsening = true;
      
      for (let i = 1; i < recentAQ.length; i++) {
        if (recentAQ[i] <= recentAQ[i-1]) worsening = false;
      }
      
      if (worsening && recentAQ[recentAQ.length - 1] > 100) {
        const detection: AIThreatDetection = {
          id: Date.now().toString(),
          type: 'environment',
          subtype: 'air-quality-trend',
          severity: 'medium',
          description: 'Air quality deteriorating rapidly in your area',
          recommendedAction: 'Consider indoor activities and close windows',
          automaticResponseTaken: null,
          timestamp: Date.now() // Changed to number
        };
        this.notifyListeners(detection);
      }
    }
    
    // Check for rising CO2 levels
    const co2Levels = this.environmentalReadingsHistory.get('co2Level') || [];
    if (co2Levels.length >= 5) {
      const recentCO2 = co2Levels.slice(-5);
      let rising = true;
      
      for (let i = 1; i < recentCO2.length; i++) {
        if (recentCO2[i] <= recentCO2[i-1]) rising = false;
      }
      
      if (rising && recentCO2[recentCO2.length - 1] > 800) {
        const detection: AIThreatDetection = {
          id: Date.now().toString(),
          type: 'environment',
          subtype: 'co2-level-trend',
          severity: 'medium',
          description: 'CO2 levels steadily increasing in your environment',
          recommendedAction: 'Improve ventilation by opening windows or doors',
          automaticResponseTaken: null,
          timestamp: Date.now() // Changed to number
        };
        this.notifyListeners(detection);
      }
    }
  }
}

// Create a singleton instance
export const aiMonitoringService = new AIMonitoringService();

export default aiMonitoringService;
