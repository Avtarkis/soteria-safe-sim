
import { toast } from '@/hooks/use-toast';

export interface APICapabilities {
  geolocation: boolean;
  camera: boolean;
  microphone: boolean;
  bluetooth: boolean;
  notifications: boolean;
  vibration: boolean;
  wakeLock: boolean;
  fileSystem: boolean;
  clipboard: boolean;
  webRTC: boolean;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

interface DeviceMotionData {
  acceleration: {
    x: number;
    y: number;
    z: number;
  };
  rotationRate: {
    alpha: number;
    beta: number;
    gamma: number;
  };
  interval: number;
}

interface DeviceOrientationData {
  alpha: number;
  beta: number;
  gamma: number;
}

interface CameraOptions {
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
}

interface VibrationOptions {
  pattern: number | number[];
  intensity?: 'light' | 'medium' | 'heavy';
}

interface MediaRecordingOptions {
  video?: boolean;
  audio?: boolean;
}

class NativeAPIManager {
  private wakeLock: any = null;

  getCapabilities(): APICapabilities {
    return {
      geolocation: 'geolocation' in navigator,
      camera: 'mediaDevices' in navigator && !!navigator.mediaDevices.getUserMedia,
      microphone: 'mediaDevices' in navigator && !!navigator.mediaDevices.getUserMedia,
      bluetooth: 'bluetooth' in navigator,
      notifications: 'Notification' in window,
      vibration: 'vibrate' in navigator,
      wakeLock: 'wakeLock' in navigator,
      fileSystem: 'showSaveFilePicker' in window,
      clipboard: 'clipboard' in navigator,
      webRTC: 'RTCPeerConnection' in window
    };
  }

  isFeatureSupported(feature: keyof APICapabilities): boolean {
    const capabilities = this.getCapabilities();
    return capabilities[feature];
  }

  async requestAllPermissions(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};
    
    // Notification permission
    try {
      const notificationPermission = await this.requestNotificationPermission();
      results.notifications = notificationPermission === 'granted';
    } catch (error) {
      results.notifications = false;
    }

    // Geolocation permission
    try {
      await this.getCurrentPosition();
      results.geolocation = true;
    } catch (error) {
      results.geolocation = false;
    }

    // Camera/microphone permission
    try {
      const stream = await this.getCameraStream();
      if (stream) {
        this.stopMediaStream(stream);
        results.camera = true;
      }
    } catch (error) {
      results.camera = false;
    }

    return results;
  }

  // Geolocation
  async getCurrentPosition(options: GeolocationOptions = {}): Promise<GeolocationPosition> {
    if (!('geolocation' in navigator)) {
      throw new Error('Geolocation not supported');
    }
    
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: options.enableHighAccuracy || true,
        timeout: options.timeout || 10000,
        maximumAge: options.maximumAge || 0
      });
    });
  }

  // Alias for getCurrentPosition to match usage
  async getCurrentLocation(options: GeolocationOptions = {}): Promise<GeolocationPosition> {
    return this.getCurrentPosition(options);
  }
  
  watchPosition(
    callback: (position: GeolocationPosition) => void,
    errorCallback?: (error: GeolocationPositionError) => void,
    options: GeolocationOptions = {}
  ): number {
    if (!('geolocation' in navigator)) {
      if (errorCallback) {
        errorCallback({
          code: 2,
          message: 'Geolocation not supported',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3
        });
      }
      return -1;
    }
    
    return navigator.geolocation.watchPosition(callback, errorCallback, {
      enableHighAccuracy: options.enableHighAccuracy || true,
      timeout: options.timeout || 10000,
      maximumAge: options.maximumAge || 0
    });
  }
  
  clearWatch(watchId: number): void {
    if ('geolocation' in navigator && watchId !== -1) {
      navigator.geolocation.clearWatch(watchId);
    }
  }
  
  // Camera access
  async getCameraStream(options: CameraOptions = {}): Promise<MediaStream> {
    if (!('mediaDevices' in navigator) || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera access not supported');
    }
    
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: options.facingMode || 'environment',
          width: options.width ? { ideal: options.width } : undefined,
          height: options.height ? { ideal: options.height } : undefined
        }
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
      throw error;
    }
  }

  // Media recording
  async startRecording(options: MediaRecordingOptions = {}): Promise<MediaStream | null> {
    if (!('mediaDevices' in navigator) || !navigator.mediaDevices.getUserMedia) {
      return null;
    }
    
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: options.video || false,
        audio: options.audio || true
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      return null;
    }
  }

  // WebRTC
  createPeerConnection(config?: RTCConfiguration): RTCPeerConnection | null {
    if (!('RTCPeerConnection' in window)) {
      return null;
    }
    
    try {
      return new RTCPeerConnection(config);
    } catch (error) {
      console.error('Error creating peer connection:', error);
      return null;
    }
  }
  
  async takePicture(videoElement: HTMLVideoElement): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get canvas context');
    }
    
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to capture image'));
        }
      }, 'image/jpeg', 0.95);
    });
  }
  
  stopMediaStream(stream: MediaStream): void {
    stream.getTracks().forEach(track => track.stop());
  }
  
  // Device motion and orientation
  startMotionTracking(callback: (data: DeviceMotionData) => void): boolean {
    if (!('DeviceMotionEvent' in window)) {
      return false;
    }
    
    const handleMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.acceleration || { x: 0, y: 0, z: 0 };
      const rotationRate = event.rotationRate || { alpha: 0, beta: 0, gamma: 0 };
      
      callback({
        acceleration: {
          x: acceleration.x || 0,
          y: acceleration.y || 0,
          z: acceleration.z || 0
        },
        rotationRate: {
          alpha: rotationRate.alpha || 0,
          beta: rotationRate.beta || 0,
          gamma: rotationRate.gamma || 0
        },
        interval: event.interval || 0
      });
    };
    
    window.addEventListener('devicemotion', handleMotion);
    return true;
  }
  
  startOrientationTracking(callback: (data: DeviceOrientationData) => void): boolean {
    if (!('DeviceOrientationEvent' in window)) {
      return false;
    }
    
    const handleOrientation = (event: DeviceOrientationEvent) => {
      callback({
        alpha: event.alpha || 0,
        beta: event.beta || 0,
        gamma: event.gamma || 0
      });
    };
    
    window.addEventListener('deviceorientation', handleOrientation);
    return true;
  }
  
  // Notifications
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }
    
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    
    if (Notification.permission !== 'denied') {
      return await Notification.requestPermission();
    }
    
    return 'denied';
  }
  
  async showNotification(title: string, options: NotificationOptions = {}): Promise<Notification | null> {
    if (!('Notification' in window)) {
      return null;
    }
    
    if (Notification.permission !== 'granted') {
      const permission = await this.requestNotificationPermission();
      if (permission !== 'granted') {
        return null;
      }
    }
    
    return new Notification(title, options);
  }
  
  // Vibration
  vibrate(options: VibrationOptions | number | number[]): boolean {
    if (!('vibrate' in navigator)) {
      return false;
    }
    
    try {
      let pattern: number | number[];
      if (typeof options === 'number' || Array.isArray(options)) {
        pattern = options;
      } else {
        pattern = options.pattern;
      }
      navigator.vibrate(pattern);
      return true;
    } catch (error) {
      console.error('Vibration error:', error);
      return false;
    }
  }
  
  // Battery status
  async getBatteryInfo(): Promise<any> {
    if (!('getBattery' in navigator)) {
      return {
        charging: true,
        level: 1,
        chargingTime: 0,
        dischargingTime: Infinity
      };
    }
    
    try {
      return await (navigator as any).getBattery();
    } catch (error) {
      console.error('Battery API error:', error);
      return {
        charging: true,
        level: 1,
        chargingTime: 0,
        dischargingTime: Infinity
      };
    }
  }
  
  // Network information
  getNetworkInfo(): any {
    if (!('connection' in navigator)) {
      return {
        type: 'unknown',
        effectiveType: '4g',
        downlinkMax: Infinity,
        downlink: 10,
        rtt: 50,
        saveData: false
      };
    }
    
    return (navigator as any).connection;
  }
  
  // Bluetooth functionality (simplified for now)
  async requestBluetoothDevice(): Promise<any> {
    if (!('bluetooth' in navigator)) {
      throw new Error('Bluetooth not supported');
    }
    
    try {
      // Simplified implementation
      console.log('Bluetooth device request simulated');
      return { id: 'mock-device', name: 'Mock Device' };
    } catch (error) {
      console.error('Bluetooth request failed:', error);
      throw error;
    }
  }

  async connectBluetoothDevice(device: any): Promise<any> {
    try {
      console.log('Connecting to Bluetooth device:', device);
      return {
        connected: true,
        connect: async () => ({
          connected: true
        })
      };
    } catch (error) {
      console.error('Bluetooth connection failed:', error);
      throw error;
    }
  }

  async subscribeToPanicButton(callback: () => void): Promise<() => void> {
    console.log('Panic button subscription simulated');
    return () => {
      console.log('Panic button unsubscribed');
    };
  }

  async sendFeedbackToBLEDevice(deviceId: string, feedback: any): Promise<void> {
    console.log('Sending feedback to BLE device:', deviceId, feedback);
  }
  
  // File system access
  async saveFile(blob: Blob, filename: string): Promise<void> {
    if (!('showSaveFilePicker' in window)) {
      // Fallback for browsers without File System Access API
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
      return;
    }
    
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'Files',
          accept: {
            'application/octet-stream': ['.bin', '.data']
          }
        }]
      });
      
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  }
  
  // Clipboard
  async copyToClipboard(text: string): Promise<boolean> {
    if (!navigator.clipboard) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch (error) {
        console.error('Fallback clipboard copy failed:', error);
        return false;
      }
    }
    
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Clipboard API error:', error);
      return false;
    }
  }
  
  // Screen wake lock
  async requestWakeLock(): Promise<boolean> {
    if (!('wakeLock' in navigator)) {
      toast({
        title: "Wake Lock Not Supported",
        description: "Your device doesn't support keeping the screen awake."
      });
      return false;
    }
    
    try {
      this.wakeLock = await (navigator as any).wakeLock.request('screen');
      return true;
    } catch (error) {
      console.error('Wake lock error:', error);
      return false;
    }
  }

  async releaseWakeLock(): Promise<void> {
    if (this.wakeLock) {
      try {
        await this.wakeLock.release();
        this.wakeLock = null;
      } catch (error) {
        console.error('Error releasing wake lock:', error);
      }
    }
  }
  
  // Device info
  getDeviceInfo(): Record<string, any> {
    const ua = navigator.userAgent;
    const platform = navigator.platform;
    const vendor = navigator.vendor;
    
    return {
      userAgent: ua,
      platform,
      vendor,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
      isIOS: /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream,
      isAndroid: /Android/.test(ua),
      isDesktop: !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
      browserName: this.detectBrowser(ua),
      language: navigator.language,
      languages: navigator.languages,
      online: navigator.onLine,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack === '1' || (window as any).doNotTrack === '1',
      hardwareConcurrency: navigator.hardwareConcurrency || 1,
      deviceMemory: (navigator as any).deviceMemory || 'unknown',
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      colorDepth: window.screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1
    };
  }
  
  private detectBrowser(ua: string): string {
    if (ua.indexOf('Firefox') > -1) {
      return 'Firefox';
    } else if (ua.indexOf('SamsungBrowser') > -1) {
      return 'Samsung Browser';
    } else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
      return 'Opera';
    } else if (ua.indexOf('Edge') > -1) {
      return 'Edge';
    } else if (ua.indexOf('Chrome') > -1) {
      return 'Chrome';
    } else if (ua.indexOf('Safari') > -1) {
      return 'Safari';
    } else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident/') > -1) {
      return 'Internet Explorer';
    } else {
      return 'Unknown';
    }
  }
}

export const nativeAPIManager = new NativeAPIManager();
export default nativeAPIManager;
