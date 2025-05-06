
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import ModelManager from './ModelManager';
import { detectThreatsFromPose } from './threatDetection';

export interface PoseDetectionResult {
  timestamp: number;
  poses: poseDetection.Pose[];
  threats: ThreatDetection[];
}

export interface ThreatDetection {
  type: 'weapon' | 'fall' | 'struggle' | 'unknown';
  confidence: number;
  details?: string;
}

export class PoseDetectionService {
  private static instance: PoseDetectionService;
  private detector: poseDetection.PoseDetector | null = null;
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
      // Initialize the detector using MoveNet
      const detectorConfig: poseDetection.MoveNetModelConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableSmoothing: true
      };
      
      this.detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet, 
        detectorConfig
      );
      
      console.log('Pose detector initialized successfully');
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
    if (!this.detector) {
      console.error('Pose detector not initialized');
      return false;
    }
    
    if (this.isRunning) {
      this.stopDetection();
    }
    
    this.videoElement = videoElement;
    this.isRunning = true;
    
    const detectionInterval = Math.floor(1000 / fps);
    
    this.detectionInterval = window.setInterval(async () => {
      if (!this.videoElement || !this.isRunning) return;
      
      try {
        // Perform pose detection
        const poses = await this.detector!.estimatePoses(this.videoElement);
        
        if (poses.length > 0) {
          // Process poses to detect threats
          const threats = detectThreatsFromPose(poses);
          
          // Send the result to the callback
          onDetection({
            timestamp: Date.now(),
            poses,
            threats
          });
        }
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

export default PoseDetectionService.getInstance();
