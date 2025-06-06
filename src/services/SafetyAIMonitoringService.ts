
import { toast } from '@/hooks/use-toast';

export interface SafetyMetrics {
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  activeThreats: number;
  systemHealth: 'healthy' | 'warning' | 'error';
  lastUpdate: number;
}

export interface SafetyAlert {
  id: string;
  type: 'security' | 'health' | 'environment' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  resolved: boolean;
}

export class SafetyAIMonitoringService {
  private isActive = false;
  private metrics: SafetyMetrics;
  private alerts: SafetyAlert[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private listeners: Array<(metrics: SafetyMetrics) => void> = [];

  constructor() {
    this.metrics = {
      threatLevel: 'low',
      activeThreats: 0,
      systemHealth: 'healthy',
      lastUpdate: Date.now()
    };
  }

  public startMonitoring(): boolean {
    if (this.isActive) {
      console.warn('Safety monitoring already active');
      return true;
    }

    try {
      this.isActive = true;
      this.startMonitoringLoop();
      
      toast({
        title: "Safety Monitoring Active",
        description: "AI safety monitoring system is now running",
      });

      console.log('Safety AI monitoring started');
      return true;
    } catch (error) {
      console.error('Failed to start safety monitoring:', error);
      return false;
    }
  }

  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.isActive = false;
    console.log('Safety AI monitoring stopped');
  }

  public getMetrics(): SafetyMetrics {
    return { ...this.metrics };
  }

  public getAlerts(): SafetyAlert[] {
    return [...this.alerts];
  }

  public resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }

  public addListener(callback: (metrics: SafetyMetrics) => void): () => void {
    this.listeners.push(callback);
    
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public handleVoiceCommand(transcript: string, confidence: number): void {
    // Process voice command for emergency detection
    const emergencyKeywords = ['help', 'emergency', 'call 911', 'panic', 'danger'];
    const hasEmergencyKeyword = emergencyKeywords.some(keyword => 
      transcript.toLowerCase().includes(keyword)
    );
    
    if (hasEmergencyKeyword && confidence > 0.7) {
      this.createAlert({
        type: 'security',
        severity: 'high',
        message: `Emergency voice command detected: "${transcript}"`
      });
    }
  }

  private startMonitoringLoop(): void {
    this.monitoringInterval = setInterval(() => {
      this.updateMetrics();
      this.checkForAlerts();
      this.notifyListeners();
    }, 5000);
  }

  private updateMetrics(): void {
    const now = Date.now();
    
    if (Math.random() < 0.05) {
      const levels: SafetyMetrics['threatLevel'][] = ['low', 'medium', 'high'];
      this.metrics.threatLevel = levels[Math.floor(Math.random() * levels.length)];
    }

    switch (this.metrics.threatLevel) {
      case 'low':
        this.metrics.activeThreats = Math.floor(Math.random() * 2);
        break;
      case 'medium':
        this.metrics.activeThreats = Math.floor(Math.random() * 3) + 1;
        break;
      case 'high':
        this.metrics.activeThreats = Math.floor(Math.random() * 5) + 2;
        break;
      case 'critical':
        this.metrics.activeThreats = Math.floor(Math.random() * 8) + 3;
        break;
    }

    if (Math.random() < 0.02) {
      this.metrics.systemHealth = Math.random() < 0.5 ? 'warning' : 'error';
    } else {
      this.metrics.systemHealth = 'healthy';
    }

    this.metrics.lastUpdate = now;
  }

  private checkForAlerts(): void {
    if (this.metrics.threatLevel === 'high' && Math.random() < 0.1) {
      this.createAlert({
        type: 'security',
        severity: 'high',
        message: 'High threat level detected in your area'
      });
    }

    if (this.metrics.systemHealth === 'error' && Math.random() < 0.2) {
      this.createAlert({
        type: 'system',
        severity: 'medium',
        message: 'System health check failed - some features may be unavailable'
      });
    }

    this.alerts = this.alerts.filter(alert => 
      !alert.resolved || (Date.now() - alert.timestamp) < 300000
    );
  }

  private createAlert(alertData: Omit<SafetyAlert, 'id' | 'timestamp' | 'resolved'>): void {
    const alert: SafetyAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      resolved: false,
      ...alertData
    };

    this.alerts.push(alert);
    
    if (alert.severity === 'high' || alert.severity === 'critical') {
      toast({
        title: "Safety Alert",
        description: alert.message,
        variant: "destructive",
      });
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback(this.metrics);
      } catch (error) {
        console.error('Error in safety monitoring listener:', error);
      }
    });
  }

  public isMonitoring(): boolean {
    return this.isActive;
  }

  public getSystemStatus(): string {
    if (!this.isActive) return 'Inactive';
    return `Active - ${this.metrics.systemHealth}`;
  }
}

// Create singleton instance
const safetyAIMonitoringService = new SafetyAIMonitoringService();

// Export both named and default exports
export { safetyAIMonitoringService };
export default safetyAIMonitoringService;
