
// Define types for the weapon detection system

export type DetectionMode = 'passive' | 'balanced' | 'aggressive';

export interface DetectionAlert {
  id: string;
  title: string;
  description: string;
  level: 1 | 2 | 3; // 1: low, 2: medium, 3: high
  timestamp: string;
  location?: [number, number]; // latitude, longitude
  weaponType?: string;
  confidence: number;
  verified: boolean;
  sensorData?: Record<string, any>;
}

export interface SensorStatus {
  active: boolean;
  status: string;
  lastReading?: number;
  confidence?: number;
}

export interface DetectionStatus {
  level: 0 | 1 | 2 | 3; // 0: normal, 1: low alert, 2: medium alert, 3: high alert
  message: string;
  lastUpdate: string;
}

export interface SensorsState {
  motion: SensorStatus;
  audio: SensorStatus;
  radioSignal: SensorStatus;
  ai: SensorStatus;
}

export interface DetectionState {
  isActive: boolean;
  detectionMode: DetectionMode;
  sensitivityLevel: number;
  sensors: SensorsState;
  detectionStatus: DetectionStatus;
  alerts: DetectionAlert[];
  lastAlert: DetectionAlert | null;
}
