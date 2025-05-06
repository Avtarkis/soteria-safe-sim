
import ModelManager from './ModelManager';
import { detectThreatsFromPose } from './threatDetection';

export interface PoseDetectionResult {
  timestamp: number;
  poses: any[];
  threats: ThreatDetection[];
}

export interface ThreatDetection {
  type: 'weapon' | 'fall' | 'struggle' | 'unknown';
  confidence: number;
  details?: string;
}

export class PoseDetectionService {
  private static instance: PoseDetectionService;
  private detector: any | null = null;
  private isRunning = false;
  private videoElement: HTMLVideoElement | null = null;
  private detectionInterval: number | null = null;
  
  private constructor() {}
  
  public static getInstance(): PoseDetectionService {
    if (!PoseDetectionService.instance) {
      PoseDetectionService.instance = new PoseDetectionService();
    }
    return PoseDetectionService.instance;
  }
  
  public async initialize(): Promise<boolean> {
    try {
      // Mock initialization
      console.log('Pose detector initialized (mock)');
      return true;
    } catch (error) {
      console.error('Failed to initialize pose detector:', error);
      return false;
    }
  }
  
  public async startDetection(
    videoElement: HTMLVideoElement, 
    onDetection: (result: PoseDetectionResult) => void,
    fps = 5
  ): Promise<boolean> {
    if (this.isRunning) {
      this.stopDetection();
    }
    
    this.videoElement = videoElement;
    this.isRunning = true;
    
    const detectionInterval = Math.floor(1000 / fps);
    
    this.detectionInterval = window.setInterval(() => {
      if (!this.videoElement || !this.isRunning) return;
      
      try {
        // Mock pose detection with sample data
        const mockPoses = [{
          keypoints: Array(17).fill(0).map((_, i) => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            score: 0.8,
            name: `keypoint_${i}`
          }))
        }];
        
        // Process poses to detect threats
        const threats = detectThreatsFromPose(mockPoses as any);
        
        // Send the result to the callback
        onDetection({
          timestamp: Date.now(),
          poses: mockPoses,
          threats
        });
      } catch (error) {
        console.error('Error during pose detection:', error);
      }
    }, detectionInterval);
    
    return true;
  }
  
  public stopDetection(): void {
    this.isRunning = false;
    
    if (this.detectionInterval !== null) {
      window.clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
    
    this.videoElement = null;
    console.log('Pose detection stopped');
  }
  
  public isDetectionRunning(): boolean {
    return this.isRunning;
  }
}

// Create and export singleton instance
const instance = PoseDetectionService.getInstance();
export default instance;
