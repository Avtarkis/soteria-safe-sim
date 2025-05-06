
import ModelManager from './ModelManager';
import { SensorDataPoint } from '../sensors/sensorTypes';

export interface HealthEvent {
  type: 'fall' | 'faint' | 'immobile' | 'erratic' | 'normal';
  confidence: number;
  timestamp: number;
  details?: string;
}

// Constants
const IMMOBILITY_THRESHOLD = 30000; // 30 seconds
const ACTIVITY_VARIANCE_THRESHOLD = 0.5;
const SENSOR_WINDOW_SIZE = 50; // Number of sensor readings to keep for analysis

export class HealthMonitorService {
  private static instance: HealthMonitorService;
  private model: any | null = null;
  private isRunning = false;
  private sensorBuffer: SensorDataPoint[] = [];
  private lastSignificantMotion = Date.now();
  private monitorInterval: number | null = null;
  
  private constructor() {}
  
  public static getInstance(): HealthMonitorService {
    if (!HealthMonitorService.instance) {
      HealthMonitorService.instance = new HealthMonitorService();
    }
    return HealthMonitorService.instance;
  }
  
  public async initialize(): Promise<boolean> {
    try {
      // Load HAR model (mock)
      this.model = await ModelManager.loadModel(
        'activity',
        'har',
        // Replace with actual model URL once available
        'https://storage.googleapis.com/tfjs-models/tfjs/har/model.json'
      );
      
      console.log('Health monitor service initialized (mock)');
      return true;
    } catch (error) {
      console.error('Failed to initialize health monitor service:', error);
      return false;
    }
  }
  
  public startMonitoring(
    onHealthEvent: (event: HealthEvent) => void,
    monitoringInterval = 2000
  ): boolean {
    if (this.isRunning) {
      return true;
    }
    
    this.isRunning = true;
    this.sensorBuffer = [];
    this.lastSignificantMotion = Date.now();
    
    // Set up interval for health checks
    this.monitorInterval = window.setInterval(() => {
      this.checkHealthStatus(onHealthEvent);
    }, monitoringInterval);
    
    console.log('Health monitoring started');
    return true;
  }
  
  public stopMonitoring(): void {
    if (!this.isRunning) return;
    
    if (this.monitorInterval !== null) {
      window.clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    
    this.isRunning = false;
    this.sensorBuffer = [];
    console.log('Health monitoring stopped');
  }
  
  public processSensorData(data: SensorDataPoint | SensorDataPoint[]): void {
    if (!this.isRunning) return;
    
    const dataPoints = Array.isArray(data) ? data : [data];
    
    // Add new data points to buffer
    this.sensorBuffer = [...this.sensorBuffer, ...dataPoints].slice(-SENSOR_WINDOW_SIZE);
    
    // Check for significant motion
    for (const point of dataPoints) {
      if (point.type === 'accelerometer') {
        const magnitude = Math.sqrt(
          Math.pow(point.x, 2) + 
          Math.pow(point.y, 2) + 
          Math.pow(point.z, 2)
        );
        
        // If there's significant motion, update timestamp
        if (magnitude > 1.2) { // Threshold for "significant" motion
          this.lastSignificantMotion = Date.now();
        }
      }
    }
  }
  
  private checkHealthStatus(onHealthEvent: (event: HealthEvent) => void): void {
    // Check for inactivity/immobility
    const timeSinceMotion = Date.now() - this.lastSignificantMotion;
    if (timeSinceMotion > IMMOBILITY_THRESHOLD) {
      onHealthEvent({
        type: 'immobile',
        confidence: Math.min(0.5 + (timeSinceMotion - IMMOBILITY_THRESHOLD) / 60000, 0.9),
        timestamp: Date.now(),
        details: `No significant movement detected for ${Math.round(timeSinceMotion / 1000)} seconds`
      });
      return;
    }
    
    // If we have enough sensor data, run more complex analysis
    if (this.sensorBuffer.length >= 20) {
      this.analyzeActivityPattern(onHealthEvent);
    }
  }
  
  private analyzeActivityPattern(onHealthEvent: (event: HealthEvent) => void): void {
    // Calculate motion variance to detect erratic movement
    const accelPoints = this.sensorBuffer.filter(p => p.type === 'accelerometer');
    if (accelPoints.length < 10) return;
    
    // Calculate average magnitude
    let sum = 0;
    const magnitudes = accelPoints.map(p => {
      const mag = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
      sum += mag;
      return mag;
    });
    
    const avg = sum / magnitudes.length;
    
    // Calculate variance
    const variance = magnitudes.reduce(
      (acc, val) => acc + Math.pow(val - avg, 2), 
      0
    ) / magnitudes.length;
    
    // Check for erratic motion
    if (variance > ACTIVITY_VARIANCE_THRESHOLD) {
      onHealthEvent({
        type: 'erratic',
        confidence: Math.min(0.5 + variance / 5, 0.9),
        timestamp: Date.now(),
        details: `Erratic movement detected (variance: ${variance.toFixed(2)})`
      });
    }
    
    // If HAR model is available, use it for more detailed analysis
    if (this.model) {
      this.runHARInference(onHealthEvent);
    }
  }
  
  private async runHARInference(onHealthEvent: (event: HealthEvent) => void): Promise<void> {
    if (!this.model || this.sensorBuffer.length < 30) return;
    
    try {
      // Mock inference without TensorFlow
      const activities = ['normal', 'fall', 'faint', 'immobile', 'erratic'];
      const randomIndex = Math.floor(Math.random() * activities.length);
      const mockConfidence = Math.random() * 0.3 + 0.6; // Between 0.6 and 0.9
      
      // Report if it's not "normal" and confidence is high
      if (activities[randomIndex] !== 'normal' && mockConfidence > 0.7 && Math.random() > 0.8) {
        onHealthEvent({
          type: activities[randomIndex] as any,
          confidence: mockConfidence,
          timestamp: Date.now(),
          details: `Detected ${activities[randomIndex]} with ${(mockConfidence * 100).toFixed(1)}% confidence`
        });
      }
      
    } catch (error) {
      console.error('Error during HAR inference:', error);
    }
  }
  
  private prepareSensorDataForModel(): number[][] | null {
    // Extract accelerometer and gyroscope data
    const accelPoints = this.sensorBuffer.filter(p => p.type === 'accelerometer');
    const gyroPoints = this.sensorBuffer.filter(p => p.type === 'gyroscope');
    
    if (accelPoints.length < 20 || gyroPoints.length < 20) {
      return null;
    }
    
    // Prepare data in the format expected by the HAR model
    const data: number[][] = [];
    
    for (let i = 0; i < Math.min(accelPoints.length, gyroPoints.length, 30); i++) {
      data.push([
        accelPoints[i].x, accelPoints[i].y, accelPoints[i].z,
        gyroPoints[i].x, gyroPoints[i].y, gyroPoints[i].z
      ]);
    }
    
    return data;
  }
  
  public isMonitoringActive(): boolean {
    return this.isRunning;
  }
}

// Create and export singleton instance
const instance = HealthMonitorService.getInstance();
export default instance;
