
interface StreamingOptions {
  video: boolean;
  audio: boolean;
  screen?: boolean;
  quality?: 'low' | 'medium' | 'high';
}

interface StreamingSession {
  id: string;
  startTime: number;
  isActive: boolean;
  options: StreamingOptions;
  recordedChunks: Blob[];
}

class LiveIncidentStreamingService {
  private currentSession: StreamingSession | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();

  async startLiveStreaming(options: StreamingOptions): Promise<string | null> {
    try {
      // Get media stream
      this.stream = await this.getMediaStream(options);
      
      if (!this.stream) {
        throw new Error('Failed to get media stream');
      }

      // Create session
      const sessionId = `stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      this.currentSession = {
        id: sessionId,
        startTime: Date.now(),
        isActive: true,
        options,
        recordedChunks: []
      };

      // Setup media recorder for local recording
      this.setupMediaRecorder();

      // Start recording
      this.mediaRecorder?.start(1000); // Collect data every second

      console.log('Live incident streaming started:', sessionId);
      return sessionId;

    } catch (error) {
      console.error('Error starting live streaming:', error);
      return null;
    }
  }

  private async getMediaStream(options: StreamingOptions): Promise<MediaStream | null> {
    try {
      const constraints: MediaStreamConstraints = {
        video: options.video,
        audio: options.audio
      };

      if (options.video) {
        constraints.video = {
          width: this.getVideoConstraints(options.quality),
          height: this.getVideoConstraints(options.quality),
          frameRate: options.quality === 'high' ? 30 : 15
        };
      }

      let stream: MediaStream;

      if (options.screen) {
        // Screen sharing
        stream = await (navigator.mediaDevices as any).getDisplayMedia(constraints);
        
        // Add audio if requested and not included
        if (options.audio) {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioStream.getAudioTracks().forEach(track => {
            stream.addTrack(track);
          });
        }
      } else {
        // Camera and microphone
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      }

      return stream;
    } catch (error) {
      console.error('Error getting media stream:', error);
      return null;
    }
  }

  private getVideoConstraints(quality?: 'low' | 'medium' | 'high') {
    switch (quality) {
      case 'high':
        return { ideal: 1920, max: 1920 }; // 1080p
      case 'medium':
        return { ideal: 1280, max: 1280 }; // 720p
      case 'low':
      default:
        return { ideal: 640, max: 640 }; // 480p
    }
  }

  private setupMediaRecorder(): void {
    if (!this.stream) return;

    try {
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && this.currentSession) {
          this.currentSession.recordedChunks.push(event.data);
          
          // Send to emergency contacts or cloud storage
          this.uploadChunk(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.finalizeRecording();
      };

    } catch (error) {
      console.error('Error setting up media recorder:', error);
    }
  }

  private async uploadChunk(chunk: Blob): Promise<void> {
    try {
      // In production, upload to cloud storage (AWS S3, Google Cloud, etc.)
      // For now, we'll simulate the upload
      console.log('Uploading chunk of size:', chunk.size);
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('sessionId', this.currentSession?.id || '');
      formData.append('timestamp', Date.now().toString());

      // In production, replace with actual upload endpoint
      // await fetch('/api/emergency/upload-stream-chunk', {
      //   method: 'POST',
      //   body: formData
      // });

    } catch (error) {
      console.error('Error uploading chunk:', error);
    }
  }

  async startWebRTCStream(targetId: string): Promise<boolean> {
    try {
      if (!this.stream) {
        throw new Error('No active stream available');
      }

      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Add stream tracks to peer connection
      this.stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.stream!);
      });

      // Store connection
      this.peerConnections.set(targetId, peerConnection);

      // Setup connection event handlers
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // Send ICE candidate to target
          this.sendSignalingMessage(targetId, {
            type: 'ice-candidate',
            candidate: event.candidate
          });
        }
      };

      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState);
      };

      // Create and send offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      this.sendSignalingMessage(targetId, {
        type: 'offer',
        offer: offer
      });

      return true;
    } catch (error) {
      console.error('Error starting WebRTC stream:', error);
      return false;
    }
  }

  private sendSignalingMessage(targetId: string, message: any): void {
    // In production, use WebSocket or SignalR for real-time communication
    console.log('Sending signaling message to', targetId, message);
    
    // Dispatch event for emergency contacts
    document.dispatchEvent(new CustomEvent('emergencyStreamSignal', {
      detail: { targetId, message }
    }));
  }

  stopStreaming(): void {
    try {
      // Stop media recorder
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }

      // Stop all tracks
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }

      // Close peer connections
      this.peerConnections.forEach(pc => pc.close());
      this.peerConnections.clear();

      // Mark session as inactive
      if (this.currentSession) {
        this.currentSession.isActive = false;
      }

      console.log('Live streaming stopped');
    } catch (error) {
      console.error('Error stopping streaming:', error);
    }
  }

  private async finalizeRecording(): Promise<void> {
    if (!this.currentSession || this.currentSession.recordedChunks.length === 0) {
      return;
    }

    try {
      // Combine all chunks
      const completeRecording = new Blob(this.currentSession.recordedChunks, {
        type: 'video/webm'
      });

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `emergency-incident-${timestamp}.webm`;

      // Save locally and upload to cloud
      await this.saveRecording(completeRecording, filename);
      
      // Notify emergency contacts
      document.dispatchEvent(new CustomEvent('emergencyRecordingComplete', {
        detail: {
          sessionId: this.currentSession.id,
          filename,
          size: completeRecording.size,
          duration: Date.now() - this.currentSession.startTime
        }
      }));

    } catch (error) {
      console.error('Error finalizing recording:', error);
    }
  }

  private async saveRecording(blob: Blob, filename: string): Promise<void> {
    try {
      // Save locally using File System API if available
      if ('showSaveFilePicker' in window) {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'Emergency recordings',
            accept: { 'video/webm': ['.webm'] }
          }]
        });

        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
        // Fallback: trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      // Upload to cloud storage
      await this.uploadToCloud(blob, filename);

    } catch (error) {
      console.error('Error saving recording:', error);
    }
  }

  private async uploadToCloud(blob: Blob, filename: string): Promise<void> {
    try {
      // In production, upload to secure cloud storage
      const formData = new FormData();
      formData.append('file', blob, filename);
      formData.append('type', 'emergency-incident');
      formData.append('timestamp', new Date().toISOString());

      // Replace with actual cloud upload endpoint
      // await fetch('/api/emergency/upload-recording', {
      //   method: 'POST',
      //   body: formData,
      //   headers: {
      //     'Authorization': `Bearer ${userToken}`
      //   }
      // });

      console.log('Recording uploaded to cloud:', filename);
    } catch (error) {
      console.error('Error uploading to cloud:', error);
    }
  }

  getCurrentSession(): StreamingSession | null {
    return this.currentSession;
  }

  isStreaming(): boolean {
    return this.currentSession?.isActive || false;
  }

  getStreamingStats(): any {
    if (!this.currentSession) return null;

    return {
      sessionId: this.currentSession.id,
      duration: Date.now() - this.currentSession.startTime,
      chunksRecorded: this.currentSession.recordedChunks.length,
      isActive: this.currentSession.isActive,
      connectedPeers: this.peerConnections.size
    };
  }
}

export const liveIncidentStreamingService = new LiveIncidentStreamingService();
export default liveIncidentStreamingService;
export type { StreamingOptions, StreamingSession };
