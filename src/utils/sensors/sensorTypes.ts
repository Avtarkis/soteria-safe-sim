
export interface SensorDataPoint {
  type: 'accelerometer' | 'gyroscope' | 'magnetometer' | 'orientation' | 'rotation';
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface SensorReadingEvent {
  id: string;
  type: string;
  value: number;
  timestamp: string;
  status: 'normal' | 'warning' | 'critical';
  environmentType?: string;
}
