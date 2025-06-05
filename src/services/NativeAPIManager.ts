import { isStoreApp, isMobile } from '@/utils/platformUtils';

export interface APICapabilities {
  geolocation: boolean;
  camera: boolean;
  pushNotifications: boolean;
  webRTC: boolean;
  fileSystem: boolean;
  vibration: boolean;
  wakeLock: boolean;
  backgroundSync: boolean;
  serviceWorker: boolean;
  bluetooth: boolean;
  nfc: boolean;
}

export interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export interface CameraOptions {
  video?: boolean;
  audio?: boolean;
  facingMode?: 'user' | 'environment';
}

export interface VibrationOptions {
  pattern?: number[];
  intensity?: 'light' | 'medium' | 'heavy';
}

export const SOTERIA_BLE_CONFIG = {
  deviceName: 'Soteria Safety Device',
  serviceUUID: 'f7ac1f10-01ab-42e9-bf3c-010203040506',
  panicTriggerCharacteristicUUID: 'f7ac1f11-01ab-42e9-bf3c-010203040506',
  feedbackCharacteristicUUID: 'f7ac1f12-01ab-42e9-bf3c-010203040506'
};

export const SOTERIA_NFC_ACTIONS = {
  ACTIVATE: 'activate',
  CANCEL: 'cancel',
  STATUS_CHECK: 'status_check'
} as const;

export interface SoteriaNFCPayload {
  soteria_action: typeof SOTERIA_NFC_ACTIONS[keyof typeof SOTERIA_NFC_ACTIONS];
  device_id: string;
}

class NativeAPIManager {
  private capabilities: APICapabilities;
  private wakeLock: WakeLockSentinel | null = null;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.capabilities = this.detectCapabilities();
    this.initializeServiceWorker();
  }

  // Detect available API capabilities
  private detectCapabilities(): APICapabilities {
    return {
      geolocation: 'geolocation' in navigator,
      camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      pushNotifications: 'Notification' in window && 'serviceWorker' in navigator,
      webRTC: 'RTCPeerConnection' in window,
      fileSystem: 'showSaveFilePicker' in window || isStoreApp(),
      vibration: 'vibrate' in navigator,
      wakeLock: 'wakeLock' in navigator,
      backgroundSync: 'serviceWorker' in navigator,
      serviceWorker: 'serviceWorker' in navigator,
      bluetooth: 'bluetooth' in navigator,
      nfc: 'nfc' in navigator || isStoreApp()
    };
  }

  // 1. Geolocation API
  async getCurrentLocation(options: LocationOptions = {}): Promise<GeolocationPosition> {
    if (!this.capabilities.geolocation) {
      throw new Error('Geolocation not supported');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: options.enableHighAccuracy ?? true,
          timeout: options.timeout ?? 15000,
          maximumAge: options.maximumAge ?? 300000
        }
      );
    });
  }

  watchLocation(
    callback: (position: GeolocationPosition) => void,
    errorCallback?: (error: GeolocationPositionError) => void,
    options: LocationOptions = {}
  ): number | null {
    if (!this.capabilities.geolocation) return null;

    return navigator.geolocation.watchPosition(
      callback,
      errorCallback,
      {
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? 30000,
        maximumAge: options.maximumAge ?? 60000
      }
    );
  }

  clearLocationWatch(watchId: number): void {
    if (this.capabilities.geolocation && watchId) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  // 2. Camera/Video API
  async startRecording(options: CameraOptions = {}): Promise<MediaStream | null> {
    if (!this.capabilities.camera) {
      console.warn('Camera API not supported');
      return null;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: options.video ?? true,
        audio: options.audio ?? true
      };

      if (options.facingMode) {
        constraints.video = {
          facingMode: options.facingMode
        };
      }

      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      console.error('Error accessing camera:', error);
      throw error;
    }
  }

  async enumerateDevices(): Promise<MediaDeviceInfo[]> {
    if (!this.capabilities.camera) return [];
    
    try {
      return await navigator.mediaDevices.enumerateDevices();
    } catch (error) {
      console.error('Error enumerating devices:', error);
      return [];
    }
  }

  // 3. Push Notification API
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!this.capabilities.pushNotifications) {
      throw new Error('Push notifications not supported');
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  async showNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    const permission = await this.requestNotificationPermission();
    
    if (permission === 'granted') {
      if (this.serviceWorkerRegistration) {
        await this.serviceWorkerRegistration.showNotification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options
        });
      } else {
        new Notification(title, options);
      }
    }
  }

  // 4. WebRTC API
  createPeerConnection(configuration?: RTCConfiguration): RTCPeerConnection | null {
    if (!this.capabilities.webRTC) return null;

    const defaultConfig: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    };

    return new RTCPeerConnection(configuration || defaultConfig);
  }

  // 5. File System API
  async saveFile(data: Blob, filename: string): Promise<void> {
    if ('showSaveFilePicker' in window) {
      try {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'Emergency recordings',
            accept: {
              'video/*': ['.mp4', '.webm'],
              'audio/*': ['.mp3', '.wav']
            }
          }]
        });

        const writable = await fileHandle.createWritable();
        await writable.write(data);
        await writable.close();
      } catch (error) {
        console.error('Error saving file:', error);
        this.fallbackDownload(data, filename);
      }
    } else {
      this.fallbackDownload(data, filename);
    }
  }

  private fallbackDownload(data: Blob, filename: string): void {
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 6. Vibration API
  vibrate(options: VibrationOptions = {}): boolean {
    if (!this.capabilities.vibration) return false;

    const pattern = options.pattern || [200, 100, 200];
    return navigator.vibrate(pattern);
  }

  stopVibration(): boolean {
    if (!this.capabilities.vibration) return false;
    return navigator.vibrate(0);
  }

  // 7. Wake Lock API
  async requestWakeLock(): Promise<boolean> {
    if (!this.capabilities.wakeLock) return false;

    try {
      this.wakeLock = await (navigator as any).wakeLock.request('screen');
      
      this.wakeLock.addEventListener('release', () => {
        console.log('Wake lock released');
        this.wakeLock = null;
      });

      return true;
    } catch (error) {
      console.error('Error requesting wake lock:', error);
      return false;
    }
  }

  async releaseWakeLock(): Promise<void> {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
    }
  }

  // 8. Background Sync API
  async registerBackgroundSync(tag: string): Promise<boolean> {
    if (!this.serviceWorkerRegistration) return false;

    try {
      await this.serviceWorkerRegistration.sync.register(tag);
      return true;
    } catch (error) {
      console.error('Error registering background sync:', error);
      return false;
    }
  }

  // 9. Service Worker API
  private async initializeServiceWorker(): Promise<void> {
    if (!this.capabilities.serviceWorker) return;

    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', this.serviceWorkerRegistration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  // 10. Web Bluetooth API
  async requestBluetoothDevice(options: RequestDeviceOptions = {}): Promise<BluetoothDevice | null> {
    if (!this.capabilities.bluetooth) {
      console.warn('Web Bluetooth not supported');
      return null;
    }

    try {
      return await (navigator as any).bluetooth.requestDevice({
        filters: [{
          name: SOTERIA_BLE_CONFIG.deviceName,
          services: [SOTERIA_BLE_CONFIG.serviceUUID]
        }],
        ...options
      });
    } catch (error) {
      console.error('Error requesting Bluetooth device:', error);
      return null;
    }
  }

  async connectBluetoothDevice(device: BluetoothDevice): Promise<BluetoothRemoteGATTServer | null> {
    try {
      if (!device.gatt) return null;
      return await device.gatt.connect();
    } catch (error) {
      console.error('Error connecting to Bluetooth device:', error);
      return null;
    }
  }

  async subscribeToPanicButton(device: BluetoothDevice): Promise<boolean> {
    try {
      if (!device.gatt?.connected) {
        console.error('Device not connected');
        return false;
      }

      const service = await device.gatt.getPrimaryService(SOTERIA_BLE_CONFIG.serviceUUID);
      const characteristic = await service.getCharacteristic(SOTERIA_BLE_CONFIG.panicTriggerCharacteristicUUID);
      
      await characteristic.startNotifications();
      
      characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        const trigger = new Uint8Array(value.buffer)[0];
        
        if (trigger === 0x01) {
          console.log('Panic button triggered via BLE!');
          // Dispatch emergency event
          document.dispatchEvent(new CustomEvent('bleEmergencyTrigger', {
            detail: { deviceId: device.id, timestamp: Date.now() }
          }));
        }
      });

      return true;
    } catch (error) {
      console.error('Error subscribing to panic button:', error);
      return false;
    }
  }

  async sendFeedbackToBLEDevice(device: BluetoothDevice, feedbackType: 'vibrate' | 'led'): Promise<boolean> {
    try {
      if (!device.gatt?.connected) return false;

      const service = await device.gatt.getPrimaryService(SOTERIA_BLE_CONFIG.serviceUUID);
      const characteristic = await service.getCharacteristic(SOTERIA_BLE_CONFIG.feedbackCharacteristicUUID);
      
      const feedbackValue = feedbackType === 'vibrate' ? new Uint8Array([0x01]) : new Uint8Array([0x02]);
      await characteristic.writeValue(feedbackValue);
      
      return true;
    } catch (error) {
      console.error('Error sending feedback to BLE device:', error);
      return false;
    }
  }

  // NFC API
  async readNFCTag(): Promise<SoteriaNFCPayload | null> {
    if (!this.capabilities.nfc) {
      console.warn('NFC not supported');
      return null;
    }

    try {
      const ndef = new (window as any).NDEFReader();
      
      return new Promise((resolve, reject) => {
        ndef.addEventListener('reading', (event: any) => {
          const message = event.message;
          
          for (const record of message.records) {
            if (record.recordType === 'text') {
              const textDecoder = new TextDecoder(record.encoding);
              const payload = textDecoder.decode(record.data);
              
              try {
                const nfcData: SoteriaNFCPayload = JSON.parse(payload);
                
                // Validate payload structure
                if (nfcData.soteria_action && nfcData.device_id) {
                  console.log('Valid Soteria NFC tag detected:', nfcData);
                  resolve(nfcData);
                } else {
                  console.warn('Invalid Soteria NFC payload');
                  resolve(null);
                }
              } catch (parseError) {
                console.error('Error parsing NFC payload:', parseError);
                resolve(null);
              }
            }
          }
        });

        ndef.addEventListener('readingerror', () => {
          reject(new Error('Error reading NFC tag'));
        });

        ndef.scan().catch(reject);
      });
    } catch (error) {
      console.error('Error reading NFC tag:', error);
      return null;
    }
  }

  async handleNFCAction(payload: SoteriaNFCPayload): Promise<void> {
    console.log('Processing NFC action:', payload);
    
    switch (payload.soteria_action) {
      case SOTERIA_NFC_ACTIONS.ACTIVATE:
        document.dispatchEvent(new CustomEvent('nfcEmergencyActivate', {
          detail: { deviceId: payload.device_id, timestamp: Date.now() }
        }));
        break;
        
      case SOTERIA_NFC_ACTIONS.CANCEL:
        document.dispatchEvent(new CustomEvent('nfcEmergencyCancel', {
          detail: { deviceId: payload.device_id, timestamp: Date.now() }
        }));
        break;
        
      case SOTERIA_NFC_ACTIONS.STATUS_CHECK:
        document.dispatchEvent(new CustomEvent('nfcStatusCheck', {
          detail: { deviceId: payload.device_id, timestamp: Date.now() }
        }));
        break;
        
      default:
        console.warn('Unknown NFC action:', payload.soteria_action);
    }
  }

  // Utility methods
  getCapabilities(): APICapabilities {
    return { ...this.capabilities };
  }

  isFeatureSupported(feature: keyof APICapabilities): boolean {
    return this.capabilities[feature];
  }

  async requestAllPermissions(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};

    // Geolocation
    if (this.capabilities.geolocation) {
      try {
        await this.getCurrentLocation();
        results.geolocation = true;
      } catch {
        results.geolocation = false;
      }
    }

    // Camera
    if (this.capabilities.camera) {
      try {
        const stream = await this.startRecording();
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          results.camera = true;
        }
      } catch {
        results.camera = false;
      }
    }

    // Notifications
    if (this.capabilities.pushNotifications) {
      const permission = await this.requestNotificationPermission();
      results.notifications = permission === 'granted';
    }

    return results;
  }
}

export const nativeAPIManager = new NativeAPIManager();
