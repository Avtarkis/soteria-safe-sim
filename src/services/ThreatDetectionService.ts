
import PoseDetectionService, { ThreatDetection } from '@/utils/ml/PoseDetectionService';
import AudioThreatDetectionService from '@/utils/ml/AudioThreatDetection';
import { AIThreatDetection } from '@/types/ai-monitoring';

type ThreatDetectionCallback = (detection: ThreatDetection | AIThreatDetection) => void;

export class ThreatDetectionService {
  private isInitialized = false;
  private isRunning = false;
  private detectionCallback: ThreatDetectionCallback | null = null;
  private videoElement: HTMLVideoElement | null = null;
  
  /**
   * Initialize threat detection systems
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      // Initialize detection services
      const poseInitialized = await PoseDetectionService.initialize();
      const audioInitialized = await AudioThreatDetectionService.initialize();
      
      this.isInitialized = poseInitialized && audioInitialized;
      console.log('ThreatDetectionService: Initialized - Pose:', poseInitialized, 'Audio:', audioInitialized);
      
      return this.isInitialized;
    } catch (error) {
      console.error('ThreatDetectionService: Error initializing:', error);
      return false;
    }
  }
  
  /**
   * Start threat detection
   */
  public async startDetection(callback: ThreatDetectionCallback): Promise<boolean> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) return false;
    }
    
    if (this.isRunning) {
      this.detectionCallback = callback;
      return true;
    }
    
    try {
      this.detectionCallback = callback;
      
      // Start audio threat detection
      await this.startAudioDetection();
      
      // Start pose detection if we have a video element
      if (this.videoElement) {
        await this.startPoseDetection();
      }
      
      this.isRunning = true;
      console.log('ThreatDetectionService: Detection started');
      return true;
    } catch (error) {
      console.error('ThreatDetectionService: Error starting detection:', error);
      return false;
    }
  }
  
  /**
   * Set video source for pose detection
   */
  public setVideoSource(videoElement: HTMLVideoElement): void {
    this.videoElement = videoElement;
    
    // If already running, start pose detection with the new video element
    if (this.isRunning && this.detectionCallback) {
      this.startPoseDetection();
    }
  }
  
  /**
   * Start audio-based threat detection
   */
  private async startAudioDetection(): Promise<void> {
    if (!this.detectionCallback) return;
    
    const onAudioThreatDetected = (result: any) => {
      if (!this.detectionCallback) return;
      
      // Map AudioThreatResult to ThreatDetection
      const threatDetection: ThreatDetection = {
        type: this.mapAudioThreatType(result.type),
        confidence: result.confidence,
        details: `Audio threat detected: ${result.type}`
      };
      
      this.detectionCallback(threatDetection);
    };
    
    await AudioThreatDetectionService.startDetection(onAudioThreatDetected);
  }
  
  /**
   * Start pose-based threat detection
   */
  private async startPoseDetection(): Promise<void> {
    if (!this.videoElement || !this.detectionCallback) return;
    
    const onPoseDetected = (result: any) => {
      if (!this.detectionCallback) return;
      
      // If threats were detected, notify callback for each one
      if (result.threats && result.threats.length > 0) {
        result.threats.forEach((threat: ThreatDetection) => {
          this.detectionCallback!(threat);
        });
      }
    };
    
    await PoseDetectionService.startDetection(this.videoElement, onPoseDetected, 5);
  }
  
  /**
   * Map audio threat type to our threat types
   */
  private mapAudioThreatType(audioType: string): 'weapon' | 'fall' | 'struggle' | 'unknown' {
    // Map audio threat types to our standard types
    switch (audioType) {
      case 'gunshot':
      case 'explosion':
        return 'weapon';
      case 'glass_breaking':
      case 'impact':
        return 'struggle';
      case 'scream':
        return 'struggle';
      default:
        return 'unknown';
    }
  }
  
  /**
   * Stop all threat detection
   */
  public stopDetection(): void {
    if (!this.isRunning) return;
    
    // Stop all detection services
    AudioThreatDetectionService.stopDetection();
    PoseDetectionService.stopDetection();
    
    this.isRunning = false;
    console.log('ThreatDetectionService: Detection stopped');
  }
  
  /**
   * Check if detection is currently running
   */
  public isDetectionRunning(): boolean {
    return this.isRunning;
  }
}
