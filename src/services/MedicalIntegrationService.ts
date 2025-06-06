
interface HealthMetrics {
  heartRate?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  oxygenSaturation?: number;
  temperature?: number;
  steps?: number;
  timestamp: number;
}

interface MedicalAlert {
  id: string;
  type: 'heart_rate' | 'blood_pressure' | 'oxygen' | 'temperature' | 'fall' | 'emergency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  metrics?: HealthMetrics;
}

interface SensorConfig {
  heartRateMonitoring: boolean;
  fallDetection: boolean;
  emergencyDetection: boolean;
  alertThresholds: {
    heartRateMin: number;
    heartRateMax: number;
    oxygenSaturationMin: number;
    temperatureMax: number;
  };
}

class MedicalIntegrationService {
  private sensors: Map<string, any> = new Map();
  private config: SensorConfig;
  private isMonitoring = false;
  private listeners: Array<(alert: MedicalAlert) => void> = [];
  private latestMetrics: HealthMetrics | null = null;

  constructor() {
    this.config = {
      heartRateMonitoring: true,
      fallDetection: true,
      emergencyDetection: true,
      alertThresholds: {
        heartRateMin: 50,
        heartRateMax: 120,
        oxygenSaturationMin: 95,
        temperatureMax: 100.4
      }
    };
  }

  async initializeMedicalSensors(): Promise<boolean> {
    try {
      // Try to access available health sensors
      await this.initializeHeartRateSensor();
      await this.initializeAccelerometer();
      await this.initializeBluetoothHealthDevices();
      
      console.log('Medical sensors initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing medical sensors:', error);
      return false;
    }
  }

  private async initializeHeartRateSensor(): Promise<void> {
    if ('navigator' in window && 'permissions' in navigator) {
      try {
        // Check for Web Bluetooth support for heart rate devices
        if ('bluetooth' in navigator) {
          console.log('Bluetooth available for heart rate monitoring');
        }
        
        // Simulate heart rate sensor for demo
        this.sensors.set('heartRate', {
          active: true,
          lastReading: Date.now()
        });
      } catch (error) {
        console.warn('Heart rate sensor not available:', error);
      }
    }
  }

  private async initializeAccelerometer(): Promise<void> {
    if ('Accelerometer' in window) {
      try {
        const sensor = new (window as any).Accelerometer({ frequency: 60 });
        sensor.addEventListener('reading', () => {
          this.processAccelerometerData(sensor.x, sensor.y, sensor.z);
        });
        sensor.start();
        this.sensors.set('accelerometer', sensor);
      } catch (error) {
        console.warn('Accelerometer not available:', error);
        // Fallback to DeviceMotionEvent
        this.initializeDeviceMotion();
      }
    } else {
      this.initializeDeviceMotion();
    }
  }

  private initializeDeviceMotion(): void {
    if ('DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', (event) => {
        if (event.accelerationIncludingGravity) {
          this.processAccelerometerData(
            event.accelerationIncludingGravity.x || 0,
            event.accelerationIncludingGravity.y || 0,
            event.accelerationIncludingGravity.z || 0
          );
        }
      });
      this.sensors.set('deviceMotion', { active: true });
    }
  }

  private async initializeBluetoothHealthDevices(): Promise<void> {
    if ('bluetooth' in navigator) {
      try {
        // Request Bluetooth devices with health services
        console.log('Bluetooth health devices available for pairing');
        this.sensors.set('bluetooth', { available: true });
      } catch (error) {
        console.warn('Bluetooth health devices not available:', error);
      }
    }
  }

  private processAccelerometerData(x: number, y: number, z: number): void {
    if (!this.config.fallDetection) return;

    // Calculate total acceleration
    const totalAcceleration = Math.sqrt(x * x + y * y + z * z);
    
    // Simple fall detection algorithm
    if (totalAcceleration > 20 || totalAcceleration < 2) {
      this.createMedicalAlert({
        type: 'fall',
        severity: 'high',
        message: 'Potential fall detected. Are you okay?',
        metrics: { timestamp: Date.now() }
      });
    }
  }

  startMonitoring(): boolean {
    if (this.isMonitoring) return true;

    try {
      this.isMonitoring = true;
      this.startPeriodicHealthChecks();
      console.log('Medical monitoring started');
      return true;
    } catch (error) {
      console.error('Error starting medical monitoring:', error);
      return false;
    }
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    // Stop all sensor monitoring
    this.sensors.forEach((sensor, key) => {
      if (sensor.stop) sensor.stop();
    });
    console.log('Medical monitoring stopped');
  }

  private startPeriodicHealthChecks(): void {
    setInterval(() => {
      if (!this.isMonitoring) return;
      
      // Simulate health metrics reading
      this.simulateHealthMetrics();
    }, 30000); // Check every 30 seconds
  }

  private simulateHealthMetrics(): void {
    // Simulate realistic health metrics for demo
    const metrics: HealthMetrics = {
      heartRate: 60 + Math.random() * 40, // 60-100 BPM
      oxygenSaturation: 95 + Math.random() * 5, // 95-100%
      temperature: 98.6 + (Math.random() - 0.5) * 2, // Around 98.6°F
      steps: Math.floor(Math.random() * 100),
      timestamp: Date.now()
    };

    this.latestMetrics = metrics;
    this.checkHealthThresholds(metrics);
  }

  private checkHealthThresholds(metrics: HealthMetrics): void {
    const { alertThresholds } = this.config;

    if (metrics.heartRate) {
      if (metrics.heartRate < alertThresholds.heartRateMin) {
        this.createMedicalAlert({
          type: 'heart_rate',
          severity: 'medium',
          message: `Low heart rate detected: ${metrics.heartRate} BPM`,
          metrics
        });
      } else if (metrics.heartRate > alertThresholds.heartRateMax) {
        this.createMedicalAlert({
          type: 'heart_rate',
          severity: 'medium',
          message: `High heart rate detected: ${metrics.heartRate} BPM`,
          metrics
        });
      }
    }

    if (metrics.oxygenSaturation && metrics.oxygenSaturation < alertThresholds.oxygenSaturationMin) {
      this.createMedicalAlert({
        type: 'oxygen',
        severity: 'high',
        message: `Low oxygen saturation: ${metrics.oxygenSaturation}%`,
        metrics
      });
    }

    if (metrics.temperature && metrics.temperature > alertThresholds.temperatureMax) {
      this.createMedicalAlert({
        type: 'temperature',
        severity: 'medium',
        message: `High temperature detected: ${metrics.temperature}°F`,
        metrics
      });
    }
  }

  private createMedicalAlert(alertData: Omit<MedicalAlert, 'id' | 'timestamp'>): void {
    const alert: MedicalAlert = {
      id: `medical-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...alertData
    };

    // Notify all listeners
    this.listeners.forEach(listener => {
      try {
        listener(alert);
      } catch (error) {
        console.error('Error in medical alert listener:', error);
      }
    });
  }

  addAlertListener(callback: (alert: MedicalAlert) => void): () => void {
    this.listeners.push(callback);
    
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getLatestMetrics(): HealthMetrics | null {
    return this.latestMetrics;
  }

  updateConfig(newConfig: Partial<SensorConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): SensorConfig {
    return { ...this.config };
  }

  isActive(): boolean {
    return this.isMonitoring;
  }

  getSensorStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    this.sensors.forEach((sensor, key) => {
      status[key] = sensor.active || sensor.available || false;
    });
    return status;
  }
}

export const medicalIntegrationService = new MedicalIntegrationService();
export default medicalIntegrationService;
export type { HealthMetrics, MedicalAlert, SensorConfig };
