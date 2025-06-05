
import { nativeAPIManager } from './NativeAPIManager';

export interface CallOptions {
  video?: boolean;
  audio?: boolean;
  emergency?: boolean;
}

export interface CallParticipant {
  id: string;
  name: string;
  type: 'emergency' | 'contact' | 'operator';
}

class EmergencyWebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private isConnected = false;

  async initializeCall(options: CallOptions = {}): Promise<boolean> {
    try {
      // Create peer connection
      this.peerConnection = nativeAPIManager.createPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          // TURN servers will be added when you provide credentials
        ]
      });

      if (!this.peerConnection) {
        throw new Error('WebRTC not supported');
      }

      // Setup event handlers
      this.setupPeerConnectionHandlers();

      // Get user media
      this.localStream = await nativeAPIManager.startRecording({
        video: options.video ?? false,
        audio: options.audio ?? true
      });

      if (this.localStream) {
        // Add local stream to peer connection
        this.localStream.getTracks().forEach(track => {
          if (this.peerConnection && this.localStream) {
            this.peerConnection.addTrack(track, this.localStream);
          }
        });
      }

      // Create data channel for emergency data
      this.dataChannel = this.peerConnection.createDataChannel('emergency', {
        ordered: true
      });

      this.setupDataChannelHandlers();

      return true;
    } catch (error) {
      console.error('Error initializing call:', error);
      return false;
    }
  }

  private setupPeerConnectionHandlers(): void {
    if (!this.peerConnection) return;

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to remote peer
        this.sendSignalingMessage('ice-candidate', event.candidate);
      }
    };

    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      document.dispatchEvent(new CustomEvent('remoteStreamReceived', {
        detail: this.remoteStream
      }));
    };

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      console.log('Connection state:', state);
      
      if (state === 'connected') {
        this.isConnected = true;
        document.dispatchEvent(new CustomEvent('callConnected'));
      } else if (state === 'disconnected' || state === 'failed') {
        this.isConnected = false;
        document.dispatchEvent(new CustomEvent('callDisconnected'));
      }
    };

    this.peerConnection.ondatachannel = (event) => {
      const channel = event.channel;
      this.setupDataChannelHandlers(channel);
    };
  }

  private setupDataChannelHandlers(channel?: RTCDataChannel): void {
    const dataChannel = channel || this.dataChannel;
    if (!dataChannel) return;

    dataChannel.onopen = () => {
      console.log('Data channel opened');
    };

    dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        document.dispatchEvent(new CustomEvent('emergencyDataReceived', {
          detail: data
        }));
      } catch (error) {
        console.error('Error parsing data channel message:', error);
      }
    };

    dataChannel.onclose = () => {
      console.log('Data channel closed');
    };
  }

  async createOffer(): Promise<RTCSessionDescriptionInit | null> {
    if (!this.peerConnection) return null;

    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      return null;
    }
  }

  async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit | null> {
    if (!this.peerConnection) return null;

    try {
      await this.peerConnection.setRemoteDescription(offer);
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error('Error creating answer:', error);
      return null;
    }
  }

  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.setRemoteDescription(answer);
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  sendEmergencyData(data: any): boolean {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      try {
        this.dataChannel.send(JSON.stringify({
          type: 'emergency',
          timestamp: Date.now(),
          data
        }));
        return true;
      } catch (error) {
        console.error('Error sending emergency data:', error);
      }
    }
    return false;
  }

  async sendLocation(): Promise<boolean> {
    try {
      const position = await nativeAPIManager.getCurrentLocation();
      return this.sendEmergencyData({
        type: 'location',
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
      });
    } catch (error) {
      console.error('Error sending location:', error);
      return false;
    }
  }

  toggleAudio(): boolean {
    if (!this.localStream) return false;

    const audioTracks = this.localStream.getAudioTracks();
    audioTracks.forEach(track => {
      track.enabled = !track.enabled;
    });

    return audioTracks.length > 0 ? audioTracks[0].enabled : false;
  }

  toggleVideo(): boolean {
    if (!this.localStream) return false;

    const videoTracks = this.localStream.getVideoTracks();
    videoTracks.forEach(track => {
      track.enabled = !track.enabled;
    });

    return videoTracks.length > 0 ? videoTracks[0].enabled : false;
  }

  endCall(): void {
    // Close data channel
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    this.remoteStream = null;
    this.isConnected = false;

    document.dispatchEvent(new CustomEvent('callEnded'));
  }

  private sendSignalingMessage(type: string, data: any): void {
    // This would integrate with your signaling server
    // For now, we'll just dispatch an event
    document.dispatchEvent(new CustomEvent('signalingMessage', {
      detail: { type, data }
    }));
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  isCallActive(): boolean {
    return this.isConnected;
  }

  getConnectionState(): RTCPeerConnectionState | null {
    return this.peerConnection?.connectionState || null;
  }
}

export const emergencyWebRTCService = new EmergencyWebRTCService();
