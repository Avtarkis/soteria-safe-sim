
interface LiveStreamingConfig {
  video: boolean;
  audio: boolean;
  screen?: boolean;
  quality: 'low' | 'medium' | 'high';
  recordingEnabled: boolean;
  cloudUploadEnabled: boolean;
}

interface StreamingSession {
  id: string;
  startTime: number;
  isActive: boolean;
  config: LiveStreamingConfig;
  recordedChunks: Blob[];
  streamUrl?: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
}

class ProductionLiveStreamingService {
  private currentSession: StreamingSession | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private emergencyContacts: EmergencyContact[] = [];
  private webRTCConnections: Map<string, RTCPeerConnection> = new Map();
  private signalingSocket: WebSocket | null = null;

  async startEmergencyStreaming(
    config: LiveStreamingConfig,
    emergencyType: string = 'general'
  ): Promise<string | null> {
    try {
      // Get user media stream
      this.stream = await this.getUserMediaStream(config);
      if (!this.stream) {
        throw new Error('Failed to access camera/microphone');
      }

      // Create session
      const sessionId = `emergency-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      this.currentSession = {
        id: sessionId,
        startTime: Date.now(),
        isActive: true,
        config,
        recordedChunks: []
      };

      // Setup recording
      if (config.recordingEnabled) {
        await this.setupMediaRecording();
      }

      // Setup live streaming to emergency contacts
      await this.setupEmergencyStreaming(emergencyType);

      // Notify emergency contacts
      await this.notifyEmergencyContacts(emergencyType, sessionId);

      console.log('Emergency live streaming started:', sessionId);
      return sessionId;

    } catch (error) {
      console.error('Failed to start emergency streaming:', error);
      return null;
    }
  }

  private async getUserMediaStream(config: LiveStreamingConfig): Promise<MediaStream | null> {
    try {
      const constraints: MediaStreamConstraints = {
        video: config.video ? {
          width: this.getVideoConstraints(config.quality),
          height: this.getVideoConstraints(config.quality),
          frameRate: config.quality === 'high' ? 30 : 24
        } : false,
        audio: config.audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      };

      let stream: MediaStream;

      if (config.screen) {
        // Screen capture with audio
        stream = await (navigator.mediaDevices as any).getDisplayMedia({
          video: true,
          audio: config.audio
        });
        
        // Add microphone audio if needed
        if (config.audio) {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioStream.getAudioTracks().forEach(track => {
            stream.addTrack(track);
          });
        }
      } else {
        // Regular camera/microphone
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      }

      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      return null;
    }
  }

  private getVideoConstraints(quality: 'low' | 'medium' | 'high') {
    switch (quality) {
      case 'high':
        return { ideal: 1920 };
      case 'medium':
        return { ideal: 1280 };
      case 'low':
      default:
        return { ideal: 640 };
    }
  }

  private async setupMediaRecording(): Promise<void> {
    if (!this.stream || !this.currentSession) return;

    try {
      // Use the best available codec
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4'
      ];

      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: selectedMimeType,
        videoBitsPerSecond: this.currentSession.config.quality === 'high' ? 2500000 : 1000000
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && this.currentSession) {
          this.currentSession.recordedChunks.push(event.data);
          
          // Upload chunk to cloud storage immediately
          if (this.currentSession.config.cloudUploadEnabled) {
            this.uploadChunkToCloud(event.data);
          }
        }
      };

      this.mediaRecorder.onstop = () => {
        this.finalizeRecording();
      };

      // Start recording with 1-second intervals
      this.mediaRecorder.start(1000);

    } catch (error) {
      console.error('Error setting up media recording:', error);
    }
  }

  private async setupEmergencyStreaming(emergencyType: string): Promise<void> {
    // Setup WebRTC signaling
    await this.setupSignalingConnection();
    
    // Create peer connections for each emergency contact
    for (const contact of this.emergencyContacts) {
      await this.createPeerConnection(contact.id);
    }

    // Create streaming offer
    await this.createStreamingOffer(emergencyType);
  }

  private async setupSignalingConnection(): Promise<void> {
    try {
      // Connect to WebRTC signaling server
      const signalingUrl = process.env.SIGNALING_SERVER_URL || 'wss://your-signaling-server.com';
      this.signalingSocket = new WebSocket(signalingUrl);

      this.signalingSocket.onopen = () => {
        console.log('Signaling connection established');
      };

      this.signalingSocket.onmessage = (event) => {
        this.handleSignalingMessage(JSON.parse(event.data));
      };

      this.signalingSocket.onerror = (error) => {
        console.error('Signaling connection error:', error);
      };

    } catch (error) {
      console.error('Error setting up signaling connection:', error);
    }
  }

  private async createPeerConnection(contactId: string): Promise<void> {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // Add TURN servers for production
        {
          urls: 'turn:your-turn-server.com:3478',
          username: 'your-username',
          credential: 'your-credential'
        }
      ]
    };

    const peerConnection = new RTCPeerConnection(configuration);

    // Add stream tracks
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.stream!);
      });
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.signalingSocket) {
        this.signalingSocket.send(JSON.stringify({
          type: 'ice-candidate',
          target: contactId,
          candidate: event.candidate
        }));
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state for ${contactId}:`, peerConnection.connectionState);
    };

    this.webRTCConnections.set(contactId, peerConnection);
  }

  private async createStreamingOffer(emergencyType: string): Promise<void> {
    for (const [contactId, peerConnection] of this.webRTCConnections) {
      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        if (this.signalingSocket) {
          this.signalingSocket.send(JSON.stringify({
            type: 'offer',
            target: contactId,
            offer: offer,
            emergencyType: emergencyType,
            sessionId: this.currentSession?.id
          }));
        }
      } catch (error) {
        console.error(`Error creating offer for ${contactId}:`, error);
      }
    }
  }

  private handleSignalingMessage(message: any): void {
    const { type, target, ...data } = message;

    switch (type) {
      case 'answer':
        this.handleAnswer(target, data.answer);
        break;
      case 'ice-candidate':
        this.handleIceCandidate(target, data.candidate);
        break;
      case 'stream-request':
        this.handleStreamRequest(target);
        break;
    }
  }

  private async handleAnswer(contactId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const peerConnection = this.webRTCConnections.get(contactId);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(answer);
    }
  }

  private async handleIceCandidate(contactId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const peerConnection = this.webRTCConnections.get(contactId);
    if (peerConnection) {
      await peerConnection.addIceCandidate(candidate);
    }
  }

  private handleStreamRequest(contactId: string): void {
    // Handle incoming stream requests from emergency contacts
    console.log(`Stream request from ${contactId}`);
  }

  private async uploadChunkToCloud(chunk: Blob): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('sessionId', this.currentSession?.id || '');
      formData.append('timestamp', Date.now().toString());

      // Upload to cloud storage service
      await fetch('/api/emergency/upload-stream-chunk', {
        method: 'POST',
        body: formData
      });

    } catch (error) {
      console.error('Error uploading chunk to cloud:', error);
    }
  }

  private async notifyEmergencyContacts(emergencyType: string, sessionId: string): Promise<void> {
    const message = `🚨 EMERGENCY ALERT 🚨\n\nType: ${emergencyType.toUpperCase()}\nLive stream available: ${window.location.origin}/emergency/stream/${sessionId}\n\nPlease respond immediately.`;

    // Send SMS notifications
    for (const contact of this.emergencyContacts) {
      try {
        await this.sendSMSNotification(contact.phone, message);
        
        if (contact.email) {
          await this.sendEmailNotification(contact.email, emergencyType, sessionId);
        }
      } catch (error) {
        console.error(`Error notifying contact ${contact.name}:`, error);
      }
    }
  }

  private async sendSMSNotification(phone: string, message: string): Promise<void> {
    // Integrate with SMS service (Twilio, etc.)
    await fetch('/api/emergency/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message })
    });
  }

  private async sendEmailNotification(email: string, emergencyType: string, sessionId: string): Promise<void> {
    // Send email notification
    await fetch('/api/emergency/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        subject: `EMERGENCY ALERT - ${emergencyType.toUpperCase()}`,
        streamUrl: `${window.location.origin}/emergency/stream/${sessionId}`
      })
    });
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

      // Upload final recording
      await this.uploadFinalRecording(completeRecording);

      // Notify completion
      document.dispatchEvent(new CustomEvent('emergencyRecordingComplete', {
        detail: {
          sessionId: this.currentSession.id,
          size: completeRecording.size,
          duration: Date.now() - this.currentSession.startTime
        }
      }));

    } catch (error) {
      console.error('Error finalizing recording:', error);
    }
  }

  private async uploadFinalRecording(recording: Blob): Promise<void> {
    const formData = new FormData();
    formData.append('recording', recording, `emergency-${this.currentSession?.id}.webm`);
    formData.append('sessionId', this.currentSession?.id || '');

    await fetch('/api/emergency/upload-final-recording', {
      method: 'POST',
      body: formData
    });
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
      this.webRTCConnections.forEach(pc => pc.close());
      this.webRTCConnections.clear();

      // Close signaling connection
      if (this.signalingSocket) {
        this.signalingSocket.close();
        this.signalingSocket = null;
      }

      // Mark session as inactive
      if (this.currentSession) {
        this.currentSession.isActive = false;
      }

      console.log('Emergency streaming stopped');
    } catch (error) {
      console.error('Error stopping streaming:', error);
    }
  }

  setEmergencyContacts(contacts: EmergencyContact[]): void {
    this.emergencyContacts = contacts;
  }

  getCurrentSession(): StreamingSession | null {
    return this.currentSession;
  }

  isStreaming(): boolean {
    return this.currentSession?.isActive || false;
  }
}

export const productionLiveStreamingService = new ProductionLiveStreamingService();
export default productionLiveStreamingService;
export type { LiveStreamingConfig, StreamingSession, EmergencyContact };
