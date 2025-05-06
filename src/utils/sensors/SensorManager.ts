
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
    // Check if required sensors are available
    if (!('DeviceMotionEvent' in window) || !('DeviceOrientationEvent' in window)) {
      console.warn('Motion sensors not available in this browser');
      return false;
    }
    
    if ('permissions' in navigator) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'accelerometer' as any });
        if (permissionStatus.state === 'denied') {
          console.warn('Accelerometer permission denied');
          return false;
        }
      } catch (e) {
        console.warn('Cannot query accelerometer permission:', e);
        // Continue anyway, many browsers don't support this API yet
      }
    }
    
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
      // Set up device motion handler
      this.deviceMotionHandler = (event: DeviceMotionEvent) => {
        if (!this.isRunning) return;
        
        const timestamp = Date.now();
        
        // Process accelerometer data
        if (event.accelerationIncludingGravity) {
          const { x, y, z } = event.accelerationIncludingGravity;
          if (x !== null && y !== null && z !== null) {
            this.addDataPoint({
              type: 'accelerometer',
              x, y, z,
              timestamp
            });
          }
        }
        
        // Process rotation rate (gyroscope)
        if (event.rotationRate) {
          const { alpha, beta, gamma } = event.rotationRate;
          if (alpha !== null && beta !== null && gamma !== null) {
            this.addDataPoint({
              type: 'gyroscope',
              x: alpha,
              y: beta,
              z: gamma,
              timestamp
            });
          }
        }
      };
      
      // Set up device orientation handler
      this.deviceOrientationHandler = (event: DeviceOrientationEvent) => {
        if (!this.isRunning) return;
        
        const { alpha, beta, gamma } = event;
        if (alpha !== null && beta !== null && gamma !== null) {
          this.addDataPoint({
            type: 'orientation',
            x: alpha,
            y: beta,
            z: gamma,
            timestamp: Date.now()
          });
        }
      };
      
      // Add event listeners
      window.addEventListener('devicemotion', this.deviceMotionHandler);
      window.addEventListener('deviceorientation', this.deviceOrientationHandler);
      
      // Set up polling interval to flush the buffer
      this.pollTimer = window.setInterval(() => {
        this.flushBuffer();
      }, this.pollInterval);
      
      console.log('Sensor collection started');
      return true;
    } catch (error) {
      console.error('Failed to start sensor collection:', error);
      this.isRunning = false;
      return false;
    }
  }
  
  public stopSensors(): void {
    if (!this.isRunning) return;
    
    // Remove event listeners
    if (this.deviceMotionHandler) {
      window.removeEventListener('devicemotion', this.deviceMotionHandler);
      this.deviceMotionHandler = null;
    }
    
    if (this.deviceOrientationHandler) {
      window.removeEventListener('deviceorientation', this.deviceOrientationHandler);
      this.deviceOrientationHandler = null;
    }
    
    // Clear intervals
    if (this.pollTimer !== null) {
      window.clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    
    this.isRunning = false;
    this.dataBuffer = [];
    this.callbacks = [];
    
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

export default SensorManager.getInstance();
