
import { toast } from '@/hooks/use-toast';

// Types for recording options
interface RecordingOptions {
  audioEnabled?: boolean;
  videoEnabled?: boolean;
  maxDuration?: number; // in milliseconds
}

// Types for stored media
interface RecordedMedia {
  id: string;
  blob: Blob;
  type: 'audio' | 'video' | 'photo';
  timestamp: number;
  duration?: number; // for audio/video
  size: number; // in bytes
}

export class IncidentRecordingService {
  private isRecording = false;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recordingStartTime = 0;
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private autoStopTimer: number | null = null;
  private mediaStorage: RecordedMedia[] = [];
  private captureInterval: number | null = null;
  private maxStorageSize = 100 * 1024 * 1024; // 100 MB default
  private currentStorageSize = 0;
  
  /**
   * Start recording audio and/or video
   */
  public async startRecording(options: RecordingOptions = {}): Promise<boolean> {
    if (this.isRecording) return true;
    
    const audioEnabled = options.audioEnabled !== false; // Default to true
    const videoEnabled = options.videoEnabled !== false; // Default to true
    const maxDuration = options.maxDuration || 30 * 60 * 1000; // 30 minutes default
    
    try {
      console.log('IncidentRecordingService: Starting recording');
      
      // Get media stream
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: audioEnabled,
        video: videoEnabled ? {
          facingMode: 'environment', 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : false
      });
      
      // Create a hidden video element to preview the stream (helps with auto-focus)
      if (videoEnabled) {
        this.createHiddenVideoElement();
      }
      
      // Start recording
      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: videoEnabled ? 'video/webm' : 'audio/webm'
      });
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
          
          // Check storage size limit
          this.checkStorageSize(event.data.size);
        }
      };
      
      this.mediaRecorder.onstop = () => {
        this.saveRecording();
      };
      
      // Start recording with 1-second chunks
      this.mediaRecorder.start(1000);
      this.recordingStartTime = Date.now();
      this.isRecording = true;
      
      // Setup auto-stop after max duration
      this.autoStopTimer = window.setTimeout(() => {
        this.stopRecording();
      }, maxDuration);
      
      // If video is enabled, periodically capture still images for evidence
      if (videoEnabled && this.videoElement) {
        this.startPeriodicCapture();
      }
      
      return true;
    } catch (error) {
      console.error('IncidentRecordingService: Error starting recording:', error);
      this.cleanup();
      return false;
    }
  }
  
  /**
   * Stop the current recording
   */
  public stopRecording(): void {
    if (!this.isRecording) return;
    
    console.log('IncidentRecordingService: Stopping recording');
    
    // Stop media recorder
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    this.cleanup();
  }
  
  /**
   * Create a hidden video element to preview the stream
   */
  private createHiddenVideoElement(): void {
    if (this.videoElement) return;
    
    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;
    video.style.position = 'absolute';
    video.style.top = '-9999px';
    video.style.left = '-9999px';
    video.style.width = '1px';
    video.style.height = '1px';
    
    document.body.appendChild(video);
    
    if (this.stream) {
      video.srcObject = this.stream;
    }
    
    this.videoElement = video;
  }
  
  /**
   * Clean up resources
   */
  private cleanup(): void {
    // Stop auto-stop timer
    if (this.autoStopTimer !== null) {
      window.clearTimeout(this.autoStopTimer);
      this.autoStopTimer = null;
    }
    
    // Stop periodic capture
    if (this.captureInterval !== null) {
      window.clearInterval(this.captureInterval);
      this.captureInterval = null;
    }
    
    // Stop all tracks in the stream
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    // Remove hidden video element
    if (this.videoElement) {
      if (this.videoElement.parentNode) {
        this.videoElement.parentNode.removeChild(this.videoElement);
      }
      this.videoElement = null;
    }
    
    this.mediaRecorder = null;
    this.isRecording = false;
  }
  
  /**
   * Save the current recording
   */
  private saveRecording(): void {
    if (this.recordedChunks.length === 0) return;
    
    try {
      const blob = new Blob(this.recordedChunks, {
        type: this.recordedChunks[0].type
      });
      
      const mediaType = blob.type.startsWith('video') ? 'video' : 'audio';
      const duration = Date.now() - this.recordingStartTime;
      
      // Store the recording
      const media: RecordedMedia = {
        id: `${mediaType}-${Date.now()}`,
        blob: blob,
        type: mediaType,
        timestamp: this.recordingStartTime,
        duration: duration,
        size: blob.size
      };
      
      this.mediaStorage.push(media);
      this.currentStorageSize += blob.size;
      
      console.log(`IncidentRecordingService: Saved ${mediaType} recording (${this.formatSize(blob.size)})`);
      
      // In a real app, you might want to upload this to a server
      this.uploadEvidence(media).catch(error => {
        console.error('IncidentRecordingService: Error uploading evidence:', error);
      });
    } catch (error) {
      console.error('IncidentRecordingService: Error saving recording:', error);
    }
    
    // Reset for next recording
    this.recordedChunks = [];
  }
  
  /**
   * Upload evidence to a remote server
   */
  private async uploadEvidence(media: RecordedMedia): Promise<boolean> {
    // In a real app, this would upload to your server
    // For now, we'll just log it
    console.log(`IncidentRecordingService: [MOCK] Uploading ${media.type} evidence (${this.formatSize(media.size)})`);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`IncidentRecordingService: [MOCK] Successfully uploaded ${media.type} evidence`);
    return true;
  }
  
  /**
   * Start taking periodic photos
   */
  private startPeriodicCapture(): void {
    if (!this.videoElement || this.captureInterval !== null) return;
    
    console.log('IncidentRecordingService: Starting periodic photo capture');
    
    // Capture a photo every 5 seconds
    this.captureInterval = window.setInterval(() => {
      this.capturePhoto();
    }, 5000);
    
    // Capture an initial photo
    this.capturePhoto();
  }
  
  /**
   * Capture a photo from the video stream
   */
  private capturePhoto(): void {
    if (!this.videoElement || !this.videoElement.videoWidth) return;
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = this.videoElement.videoWidth;
      canvas.height = this.videoElement.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Draw the current video frame to the canvas
      ctx.drawImage(this.videoElement, 0, 0);
      
      // Convert to blob
      canvas.toBlob(blob => {
        if (!blob) return;
        
        // Store the photo
        const media: RecordedMedia = {
          id: `photo-${Date.now()}`,
          blob: blob,
          type: 'photo',
          timestamp: Date.now(),
          size: blob.size
        };
        
        this.mediaStorage.push(media);
        this.currentStorageSize += blob.size;
        
        console.log(`IncidentRecordingService: Captured photo (${this.formatSize(blob.size)})`);
        
        // Check storage size limit
        this.checkStorageSize(blob.size);
        
        // In a real app, you might want to upload this to a server
        this.uploadEvidence(media).catch(error => {
          console.error('IncidentRecordingService: Error uploading photo:', error);
        });
      }, 'image/jpeg', 0.8);
    } catch (error) {
      console.error('IncidentRecordingService: Error capturing photo:', error);
    }
  }
  
  /**
   * Check if we're exceeding storage limits
   */
  private checkStorageSize(addedSize: number): void {
    // If we're approaching the limit, remove oldest recordings
    if (this.currentStorageSize > this.maxStorageSize * 0.9) {
      console.log('IncidentRecordingService: Storage limit approaching, removing oldest recordings');
      
      // Sort by timestamp (oldest first)
      this.mediaStorage.sort((a, b) => a.timestamp - b.timestamp);
      
      // Remove oldest recordings until we're under 80% of the limit
      while (this.currentStorageSize > this.maxStorageSize * 0.8 && this.mediaStorage.length > 1) {
        const oldest = this.mediaStorage.shift();
        if (oldest) {
          this.currentStorageSize -= oldest.size;
          console.log(`IncidentRecordingService: Removed ${oldest.type} recording from ${new Date(oldest.timestamp).toLocaleTimeString()}`);
        }
      }
    }
  }
  
  /**
   * Format byte size to human-readable string
   */
  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
  
  /**
   * Get all recorded media
   */
  public getRecordedMedia(): RecordedMedia[] {
    return [...this.mediaStorage];
  }
  
  /**
   * Get total storage usage
   */
  public getStorageUsage(): { used: number, total: number, percentage: number } {
    return {
      used: this.currentStorageSize,
      total: this.maxStorageSize,
      percentage: (this.currentStorageSize / this.maxStorageSize) * 100
    };
  }
  
  /**
   * Check if recording is active
   */
  public isRecordingActive(): boolean {
    return this.isRecording;
  }
}
