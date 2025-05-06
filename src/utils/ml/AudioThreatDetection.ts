
import ModelManager from './ModelManager';

export interface AudioThreatResult {
  detected: boolean;
  type: string;
  confidence: number;
  timestamp: number;
}

export interface AudioClassificationResult {
  label: string;
  score: number;
}

// YAMNet model class mappings for threat sounds
const THREAT_CLASSES = {
  'Gunshot, gunfire': 'gunshot',
  'Machine gun': 'gunshot',
  'Rifle': 'gunshot',
  'Shotgun': 'gunshot',
  'Screaming': 'scream',
  'Cry, sob': 'scream',
  'Crying, sobbing': 'scream',
  'Shriek': 'scream',
  'Shout': 'scream',
  'Explosion': 'explosion',
  'Boom': 'explosion',
  'Breaking': 'glass_breaking',
  'Smash, crash': 'impact',
  'Car alarm': 'alarm',
  'Siren': 'siren',
  'Fire alarm': 'alarm',
  'Emergency vehicle': 'siren',
  'Police car (siren)': 'siren',
  'Ambulance (siren)': 'siren',
  'Fire engine, fire truck (siren)': 'siren'
};

// Confidence thresholds for different threat types
const THREAT_THRESHOLDS: Record<string, number> = {
  'gunshot': 0.6,
  'scream': 0.7,
  'explosion': 0.65,
  'glass_breaking': 0.75,
  'impact': 0.8,
  'alarm': 0.7,
  'siren': 0.7
};

export class AudioThreatDetectionService {
  private static instance: AudioThreatDetectionService;
  private model: any | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private isRunning = false;
  private lastPredictionTime = 0;
  private predictionInterval = 1000; // ms between predictions
  private audioBuffer: Float32Array[] = [];
  private classNames: string[] = [];
  
  private constructor() {}
  
  public static getInstance(): AudioThreatDetectionService {
    if (!AudioThreatDetectionService.instance) {
      AudioThreatDetectionService.instance = new AudioThreatDetectionService();
    }
    return AudioThreatDetectionService.instance;
  }
  
  public async initialize(): Promise<boolean> {
    try {
      // Load YAMNet model (mock)
      this.model = await ModelManager.loadModel(
        'audio',
        'yamnet',
        'https://tfhub.dev/google/tfjs-model/yamnet/tfjs/1'
      );
      
      if (!this.model) {
        console.error('Failed to load YAMNet model');
        return false;
      }
      
      // Mock class names
      this.classNames = Object.keys(THREAT_CLASSES).concat(['Background noise', 'Speech', 'Music']);
      
      console.log('Audio threat detection service initialized (mock)');
      return true;
    } catch (error) {
      console.error('Failed to initialize audio threat detection service:', error);
      return false;
    }
  }
  
  public async startDetection(onThreatDetected: (result: AudioThreatResult) => void): Promise<boolean> {
    if (!this.model) {
      console.error('YAMNet model not loaded');
      return false;
    }
    
    if (this.isRunning) {
      this.stopDetection();
    }
    
    try {
      // Mock audio setup
      console.log('Audio threat detection started (mock)');
      this.isRunning = true;
      
      // Set up a mock interval for generating random threat events
      window.setInterval(() => {
        // Occasionally generate a mock threat (10% chance)
        if (Math.random() < 0.1 && this.isRunning) {
          const threatTypes = Object.values(THREAT_CLASSES);
          const randomType = threatTypes[Math.floor(Math.random() * threatTypes.length)];
          const confidence = Math.random() * 0.3 + 0.7; // Between 0.7 and 1.0
          
          onThreatDetected({
            detected: true,
            type: randomType,
            confidence,
            timestamp: Date.now()
          });
        }
      }, 10000); // Check every 10 seconds
      
      return true;
    } catch (error) {
      console.error('Failed to start audio threat detection:', error);
      return false;
    }
  }
  
  public stopDetection(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    this.audioBuffer = [];
    console.log('Audio threat detection stopped');
  }
  
  public isDetectionRunning(): boolean {
    return this.isRunning;
  }

  // Mock implementation for classes that had type errors
  private getTopK(values: Float32Array, k: number): Array<{ index: number, score: number }> {
    const result: Array<{ index: number, score: number }> = [];
    
    // Create mock results
    for (let i = 0; i < k; i++) {
      result.push({
        index: Math.floor(Math.random() * this.classNames.length),
        score: Math.random()
      });
    }
    
    return result;
  }
  
  private mapToThreatType(label: string): string | null {
    // Check if the label is in our threat classes map
    for (const [className, threatType] of Object.entries(THREAT_CLASSES)) {
      if (label.includes(className)) {
        return threatType;
      }
    }
    
    return null;
  }
}

// Create and export singleton instance
const instance = AudioThreatDetectionService.getInstance();
export default instance;
