
import { SensorDataPoint, SensorReadingEvent } from './sensorTypes';

export type SensorDataCallback = (data: SensorDataPoint | SensorDataPoint[]) => void;

export class SensorManager {
  private static instance: SensorManager;
  private callbacks: SensorDataCallback[] = [];
  private isRunning = false;
  private pollInterval = 100; // ms
  private pollTimer: number | null = null;
  
  // Sensor data buffer
  private dataBuffer: SensorDataPoint[] = [];
  
  // Sensor check intervals
  private accelerometerInterval: number | null = null;
  private gyroscopeInterval: number | null = null;
  private deviceMotionHandler: ((event: DeviceMotionEvent) => void) | null = null;
  private deviceOrientationHandler: ((event: DeviceOrientationEvent) => void) | null = null;
  
  private constructor() {}
  
  public static getInstance(): SensorManager {
    if (!SensorManager.instance) {
      SensorManager.instance = new SensorManager();
    }
    return SensorManager.instance;
  }
  
  public async initialize(): Promise<boolean> {
    console.log('Sensor manager initialized');
    return true;
  }
  
  public startSensors(): boolean {
    if (this.isRunning) {
      return true;
    }
    
    this.isRunning = true;
    this.dataBuffer = [];
    
    try {
      // Set up mock device motion handler for development
      this.pollTimer = window.setInterval(() => {
        if (!this.isRunning) return;
        
        // Generate mock accelerometer data
        this.addDataPoint({
          type: 'accelerometer',
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: 9.8 + (Math.random() - 0.5),
          timestamp: Date.now()
        });
        
        // Generate mock gyroscope data
        this.addDataPoint({
          type: 'gyroscope',
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
          z: (Math.random() - 0.5) * 0.1,
          timestamp: Date.now()
        });
        
        // Flush the buffer
        this.flushBuffer();
      }, this.pollInterval);
      
      console.log('Sensor collection started (mock)');
      return true;
    } catch (error) {
      console.error('Failed to start sensor collection:', error);
      this.isRunning = false;
      return false;
    }
  }
  
  public stopSensors(): void {
    if (!this.isRunning) return;
    
    // Clear intervals
    if (this.pollTimer !== null) {
      window.clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    
    this.isRunning = false;
    this.dataBuffer = [];
    
    console.log('Sensor collection stopped');
  }
  
  public subscribe(callback: SensorDataCallback): boolean {
    if (!callback || typeof callback !== 'function') {
      return false;
    }
    
    this.callbacks.push(callback);
    return true;
  }
  
  public unsubscribe(callback: SensorDataCallback): boolean {
    const index = this.callbacks.indexOf(callback);
    if (index === -1) {
      return false;
    }
    
    this.callbacks.splice(index, 1);
    return true;
  }
  
  public processEnvironmentReading(reading: SensorReadingEvent): void {
    // Process readings from external sources (e.g., smartwatches)
    console.log('Processing reading:', reading);
    
    // Currently just logging, but could be expanded to include in detection systems
  }
  
  private addDataPoint(data: SensorDataPoint): void {
    this.dataBuffer.push(data);
  }
  
  private flushBuffer(): void {
    if (this.dataBuffer.length === 0) return;
    
    const dataCopy = [...this.dataBuffer];
    this.dataBuffer = [];
    
    // Notify all subscribers
    this.callbacks.forEach(callback => {
      try {
        callback(dataCopy);
      } catch (e) {
        console.error('Error in sensor data callback:', e);
      }
    });
  }
  
  public getSensorData(): SensorDataPoint[] {
    return [...this.dataBuffer];
  }
  
  public isActive(): boolean {
    return this.isRunning;
  }
}

// Create and export singleton instance
const instance = SensorManager.getInstance();
export default instance;
