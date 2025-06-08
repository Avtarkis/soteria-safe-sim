import { nativeAPIManager } from './NativeAPIManager';

export interface RecordingOptions {
  type: 'video' | 'audio' | 'photo';
  quality?: 'low' | 'medium' | 'high';
  duration?: number; // in seconds
  stealth?: boolean;
}

export interface RecordingData {
  id: string;
  type: 'video' | 'audio' | 'photo';
  blob: Blob;
  timestamp: number;
  location?: GeolocationPosition;
  duration?: number;
}

class EmergencyRecordingService {
  private activeRecordings: Map<string, MediaRecorder> = new Map();
  private recordings: RecordingData[] = [];

  async startRecording(options: RecordingOptions): Promise<string | null> {
    try {
      const recordingId = `recording-${Date.now()}`;
      
      // Get user media based on recording type
      const stream = await this.getMediaStream(options);
      if (!stream) {
        throw new Error('Unable to access media devices');
      }

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: this.getBestMimeType(options.type)
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { 
          type: options.type === 'video' ? 'video/webm' : 'audio/webm' 
        });

        // Get location if available
        let location: GeolocationPosition | undefined;
        try {
          location = await nativeAPIManager.getCurrentLocation();
        } catch (error) {
          console.warn('Could not get location for recording:', error);
        }

        const recordingData: RecordingData = {
          id: recordingId,
          type: options.type,
          blob,
          timestamp: Date.now(),
          location,
          duration: options.duration
        };

        this.recordings.push(recordingData);
        
        // Auto-save in stealth mode
        if (options.stealth) {
          await this.saveRecording(recordingData);
        }

        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        this.activeRecordings.delete(recordingId);

        // Dispatch event
        document.dispatchEvent(new CustomEvent('recordingCompleted', {
          detail: recordingData
        }));
      };

      // Start recording
      mediaRecorder.start();
      this.activeRecordings.set(recordingId, mediaRecorder);

      // Auto-stop after duration if specified
      if (options.duration) {
        setTimeout(() => {
          this.stopRecording(recordingId);
        }, options.duration * 1000);
      }

      // Vibrate to indicate recording started (stealth mode)
      if (options.stealth) {
        nativeAPIManager.vibrate({ pattern: [50] });
      }

      console.log(`Started ${options.type} recording:`, recordingId);
      return recordingId;

    } catch (error) {
      console.error('Error starting recording:', error);
      return null;
    }
  }

  stopRecording(recordingId: string): boolean {
    const mediaRecorder = this.activeRecordings.get(recordingId);
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      return true;
    }
    return false;
  }

  stopAllRecordings(): void {
    this.activeRecordings.forEach((recorder, id) => {
      this.stopRecording(id);
    });
  }

  async takePhoto(): Promise<RecordingData | null> {
    try {
      const stream = await nativeAPIManager.startRecording({
        video: true,
        audio: false
      });

      if (!stream) return null;

      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      return new Promise((resolve) => {
        video.onloadedmetadata = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0);
          
          canvas.toBlob(async (blob) => {
            if (blob) {
              // Get location
              let location: GeolocationPosition | undefined;
              try {
                location = await nativeAPIManager.getCurrentLocation();
              } catch (error) {
                console.warn('Could not get location for photo:', error);
              }

              const photoData: RecordingData = {
                id: `photo-${Date.now()}`,
                type: 'photo',
                blob,
                timestamp: Date.now(),
                location
              };

              this.recordings.push(photoData);
              
              // Cleanup
              stream.getTracks().forEach(track => track.stop());
              
              resolve(photoData);
            } else {
              resolve(null);
            }
          }, 'image/jpeg', 0.9);
        };
      });
    } catch (error) {
      console.error('Error taking photo:', error);
      return null;
    }
  }

  private async getMediaStream(options: RecordingOptions): Promise<MediaStream | null> {
    const cameraOptions = {
      video: options.type === 'video' || options.type === 'photo',
      audio: options.type === 'video' || options.type === 'audio'
    };

    return await nativeAPIManager.startRecording(cameraOptions);
  }

  private getVideoConstraints(quality: 'low' | 'medium' | 'high' = 'medium') {
    switch (quality) {
      case 'low':
        return { width: 480, height: 320 };
      case 'high':
        return { width: 1920, height: 1080 };
      default:
        return { width: 1280, height: 720 };
    }
  }

  private getBestMimeType(type: 'video' | 'audio' | 'photo'): string {
    if (type === 'video') {
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        return 'video/webm;codecs=vp9';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        return 'video/webm;codecs=vp8';
      }
      return 'video/webm';
    } else {
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        return 'audio/webm;codecs=opus';
      }
      return 'audio/webm';
    }
  }

  async saveRecording(recording: RecordingData): Promise<void> {
    const filename = `emergency-${recording.type}-${new Date(recording.timestamp).toISOString()}.${this.getFileExtension(recording.type)}`;
    await nativeAPIManager.saveFile(recording.blob, filename);
  }

  private getFileExtension(type: 'video' | 'audio' | 'photo'): string {
    switch (type) {
      case 'video': return 'webm';
      case 'audio': return 'webm';
      case 'photo': return 'jpg';
    }
  }

  getRecordings(): RecordingData[] {
    return [...this.recordings];
  }

  getActiveRecordings(): string[] {
    return Array.from(this.activeRecordings.keys());
  }

  clearRecordings(): void {
    this.recordings = [];
  }

  isRecording(): boolean {
    return this.activeRecordings.size > 0;
  }
}

export const emergencyRecordingService = new EmergencyRecordingService();
