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

// BLE Device Specifications
export const SOTERIA_BLE_CONFIG = {
  deviceName: 'Soteria Safety Device',
  serviceUUID: 'f7ac1f10-01ab-42e9-bf3c-010203040506',
  panicTriggerCharacteristicUUID: 'f7ac1f11-01ab-42e9-bf3c-010203040506',
  feedbackCharacteristicUUID: 'f7ac1f12-01ab-42e9-bf3c-010203040506'
};

// NFC Command Specifications
export const SOTERIA_NFC_ACTIONS = {
  ACTIVATE: 'activate',
  CANCEL: 'cancel',
  STATUS_CHECK: 'status_check'
} as const;

export interface SoteriaNFCPayload {
  soteria_action: typeof SOTERIA_NFC_ACTIONS[keyof typeof SOTERIA_NFC_ACTIONS];
  device_id: string;
}

// Add Bluetooth type definitions
interface BluetoothDevice {
  id: string;
  name: string;
  gatt?: {
    connected: boolean;
    connect(): Promise<BluetoothRemoteGATTServer>;
  };
}

interface BluetoothRemoteGATTServer {
  connected: boolean;
  getPrimaryService(serviceUUID: string): Promise<any>;
}

class NativeAPIManager {
  private capabilities: APICapabilities;
  private wakeLock: WakeLockSentinel | null = null;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.capabilities = this.detectCapabilities();
    this.initializeServiceWorker();
  }

  private detectCapabilities(): APICapabilities {
    return {
      geolocation: 'geolocation' in navigator,
      camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      pushNotifications: 'Notification' in window && 'serviceWorker' in navigator,
      webRTC: 'RTCPeerConnection' in window,
      fileSystem: 'showSaveFilePicker' in window || 'webkitRequestFileSystem' in window || isStoreApp(),
      vibration: 'vibrate' in navigator,
      wakeLock: 'wakeLock' in navigator,
      backgroundSync: 'serviceWorker' in navigator,
      serviceWorker: 'serviceWorker' in navigator,
      bluetooth: 'bluetooth' in navigator,
      nfc: 'nfc' in navigator || isStoreApp()
    };
  }

  // 1. Geolocation API - Enhanced with GPS fallback
  async getCurrentLocation(options: LocationOptions = {}): Promise<GeolocationPosition> {
    if (!this.capabilities.geolocation) {
      throw new Error('Geolocation not supported');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
          console.error('Geolocation error:', error);
          if (isStoreApp()) {
            // Try native GPS if available
            this.tryNativeGPS().then(resolve).catch(reject);
          } else {
            reject(error);
          }
        },
        {
          enableHighAccuracy: options.enableHighAccuracy ?? true,
          timeout: options.timeout ?? 15000,
          maximumAge: options.maximumAge ?? 300000
        }
      );
    });
  }

  private async tryNativeGPS(): Promise<GeolocationPosition> {
    // Native GPS fallback for hybrid apps
    return new Promise((resolve, reject) => {
      if ((window as any).DeviceMotionEvent) {
        // Try to access native location services
        reject(new Error('Native GPS not available'));
      } else {
        reject(new Error('No GPS available'));
      }
    });
  }

  // 2. Camera/Video API - Enhanced WebRTC implementation
  async startRecording(options: CameraOptions = {}): Promise<MediaStream | null> {
    if (!this.capabilities.camera) {
      console.warn('Camera API not supported');
      return null;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: options.video !== false ? {
          facingMode: options.facingMode || 'environment',
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 }
        } : false,
        audio: options.audio !== false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Store reference for emergency recording
      (window as any)._emergencyStream = stream;
      
      return stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
      throw error;
    }
  }

  // 3. Push Notification API - Enhanced with FCM/APNs support
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!this.capabilities.pushNotifications) {
      throw new Error('Push notifications not supported');
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      
      // Initialize push subscription for mobile
      if (permission === 'granted' && this.serviceWorkerRegistration) {
        await this.setupPushSubscription();
      }
      
      return permission;
    }

    return Notification.permission;
  }

  private async setupPushSubscription(): Promise<void> {
    if (!this.serviceWorkerRegistration) return;

    try {
      const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY
      });

      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      console.error('Error setting up push subscription:', error);
    }
  }

  // 4. WebRTC API - Enhanced for emergency live streaming
  createEmergencyRTCConnection(configuration?: RTCConfiguration): RTCPeerConnection | null {
    if (!this.capabilities.webRTC) return null;

    const config: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10,
      ...configuration
    };

    const pc = new RTCPeerConnection(config);
    
    // Add emergency stream if available
    const emergencyStream = (window as any)._emergencyStream;
    if (emergencyStream) {
      emergencyStream.getTracks().forEach((track: MediaStreamTrack) => {
        pc.addTrack(track, emergencyStream);
      });
    }

    return pc;
  }

  // 5. File System API - Enhanced with IndexedDB fallback
  async saveEmergencyFile(data: Blob, filename: string, type: 'video' | 'audio' | 'photo'): Promise<void> {
    try {
      if ('showSaveFilePicker' in window) {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'Emergency recordings',
            accept: {
              'video/*': ['.mp4', '.webm'],
              'audio/*': ['.mp3', '.wav'],
              'image/*': ['.jpg', '.png']
            }
          }]
        });

        const writable = await fileHandle.createWritable();
        await writable.write(data);
        await writable.close();
      } else {
        // Fallback to IndexedDB
        await this.saveToIndexedDB(data, filename, type);
      }
    } catch (error) {
      console.error('Error saving emergency file:', error);
      this.fallbackDownload(data, filename);
    }
  }

  private async saveToIndexedDB(data: Blob, filename: string, type: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SoteriaEmergencyFiles', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['files'], 'readwrite');
        const store = transaction.objectStore('files');
        
        store.add({
          filename,
          type,
          data,
          timestamp: Date.now()
        });
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'filename' });
        }
      };
    });
  }

  // 6. Vibration API - Enhanced emergency patterns
  vibrateEmergencyPattern(pattern: 'alert' | 'sos' | 'custom', customPattern?: number[]): boolean {
    if (!this.capabilities.vibration) return false;

    let vibrationPattern: number[];
    
    switch (pattern) {
      case 'alert':
        vibrationPattern = [200, 100, 200, 100, 200];
        break;
      case 'sos':
        // S.O.S pattern: ... --- ...
        vibrationPattern = [100, 100, 100, 100, 100, 300, 300, 100, 300, 100, 300, 300, 100, 100, 100, 100, 100];
        break;
      case 'custom':
        vibrationPattern = customPattern || [200];
        break;
      default:
        vibrationPattern = [200];
    }

    return navigator.vibrate(vibrationPattern);
  }

  // 7. Wake Lock API - Enhanced for emergency mode
  async requestEmergencyWakeLock(): Promise<boolean> {
    if (!this.capabilities.wakeLock) return false;

    try {
      this.wakeLock = await (navigator as any).wakeLock.request('screen');
      
      this.wakeLock.addEventListener('release', () => {
        console.log('Emergency wake lock released');
        this.wakeLock = null;
      });

      // Re-acquire wake lock if tab becomes visible again
      document.addEventListener('visibilitychange', async () => {
        if (document.visibilityState === 'visible' && this.wakeLock === null) {
          this.wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      });

      return true;
    } catch (error) {
      console.error('Error requesting emergency wake lock:', error);
      return false;
    }
  }

  // 8. Background Sync API - Enhanced for emergency data
  async registerEmergencySync(data: any): Promise<boolean> {
    if (!this.serviceWorkerRegistration) return false;

    try {
      // Store emergency data for sync
      await this.storeEmergencyData(data);
      
      // Register sync
      if ('sync' in this.serviceWorkerRegistration) {
        await (this.serviceWorkerRegistration as any).sync.register('emergency-sync');
      }
      return true;
    } catch (error) {
      console.error('Error registering emergency sync:', error);
      return false;
    }
  }

  private async storeEmergencyData(data: any): Promise<void> {
    localStorage.setItem('emergency-sync-data', JSON.stringify({
      ...data,
      timestamp: Date.now()
    }));
  }

  // 9. Service Worker API - Enhanced initialization
  private async initializeServiceWorker(): Promise<void> {
    if (!this.capabilities.serviceWorker) return;

    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      // Handle emergency sync
      this.serviceWorkerRegistration.addEventListener('sync', (event: any) => {
        if (event.tag === 'emergency-sync') {
          event.waitUntil(this.handleEmergencySync());
        }
      });

      console.log('Service Worker registered successfully');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  private async handleEmergencySync(): Promise<void> {
    const data = localStorage.getItem('emergency-sync-data');
    if (data) {
      try {
        await fetch('/api/emergency/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: data
        });
        localStorage.removeItem('emergency-sync-data');
      } catch (error) {
        console.error('Emergency sync failed:', error);
      }
    }
  }

  // 10. Web Bluetooth API - Soteria Device Integration
  async connectSoteriaDevice(): Promise<BluetoothDevice | null> {
    if (!this.capabilities.bluetooth) {
      console.warn('Web Bluetooth not supported');
      return null;
    }

    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{
          name: SOTERIA_BLE_CONFIG.deviceName,
          services: [SOTERIA_BLE_CONFIG.serviceUUID]
        }]
      });

      const server = await device.gatt.connect();
      await this.setupPanicButtonListener(device, server);
      
      return device;
    } catch (error) {
      console.error('Error connecting to Soteria device:', error);
      return null;
    }
  }

  private async setupPanicButtonListener(device: BluetoothDevice, server: BluetoothRemoteGATTServer): Promise<void> {
    try {
      const service = await server.getPrimaryService(SOTERIA_BLE_CONFIG.serviceUUID);
      const characteristic = await service.getCharacteristic(SOTERIA_BLE_CONFIG.panicTriggerCharacteristicUUID);
      
      await characteristic.startNotifications();
      
      characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        const trigger = new Uint8Array(value.buffer)[0];
        
        if (trigger === 0x01) {
          console.log('Emergency panic button triggered!');
          this.handlePanicButtonTrigger(device.id);
        }
      });
    } catch (error) {
      console.error('Error setting up panic button listener:', error);
    }
  }

  private handlePanicButtonTrigger(deviceId: string): void {
    // Dispatch emergency event
    document.dispatchEvent(new CustomEvent('emergencyPanicTrigger', {
      detail: { 
        source: 'ble',
        deviceId,
        timestamp: Date.now()
      }
    }));
  }

  async sendDeviceFeedback(device: BluetoothDevice, feedbackType: 'vibrate' | 'led'): Promise<boolean> {
    try {
      if (!device.gatt?.connected) return false;

      const service = await device.gatt.getPrimaryService(SOTERIA_BLE_CONFIG.serviceUUID);
      const characteristic = await service.getCharacteristic(SOTERIA_BLE_CONFIG.feedbackCharacteristicUUID);
      
      const feedbackValue = feedbackType === 'vibrate' ? new Uint8Array([0x01]) : new Uint8Array([0x02]);
      await characteristic.writeValue(feedbackValue);
      
      return true;
    } catch (error) {
      console.error('Error sending device feedback:', error);
      return false;
    }
  }

  // NFC API - Soteria Tag Integration
  async startNFCWatch(): Promise<void> {
    if (!this.capabilities.nfc) {
      console.warn('NFC not supported');
      return;
    }

    try {
      const ndef = new (window as any).NDEFReader();
      
      ndef.addEventListener('reading', (event: any) => {
        this.handleNFCReading(event);
      });

      await ndef.scan();
      console.log('NFC watch started for Soteria tags');
    } catch (error) {
      console.error('Error starting NFC watch:', error);
    }
  }

  private handleNFCReading(event: any): void {
    try {
      const message = event.message;
      
      for (const record of message.records) {
        if (record.recordType === 'text') {
          const textDecoder = new TextDecoder(record.encoding);
          const payload = textDecoder.decode(record.data);
          
          const nfcData: SoteriaNFCPayload = JSON.parse(payload);
          
          if (this.validateNFCPayload(nfcData)) {
            this.handleSoteriaAction(nfcData);
          }
        }
      }
    } catch (error) {
      console.error('Error handling NFC reading:', error);
    }
  }

  private validateNFCPayload(payload: any): payload is SoteriaNFCPayload {
    return payload &&
           typeof payload.soteria_action === 'string' &&
           typeof payload.device_id === 'string' &&
           Object.values(SOTERIA_NFC_ACTIONS).includes(payload.soteria_action);
  }

  private handleSoteriaAction(payload: SoteriaNFCPayload): void {
    console.log('Soteria NFC action:', payload);
    
    const eventMap = {
      [SOTERIA_NFC_ACTIONS.ACTIVATE]: 'emergencyNFCActivate',
      [SOTERIA_NFC_ACTIONS.CANCEL]: 'emergencyNFCCancel',
      [SOTERIA_NFC_ACTIONS.STATUS_CHECK]: 'emergencyNFCStatusCheck'
    };

    const eventName = eventMap[payload.soteria_action];
    if (eventName) {
      document.dispatchEvent(new CustomEvent(eventName, {
        detail: {
          deviceId: payload.device_id,
          timestamp: Date.now()
        }
      }));
    }
  }

  // Utility methods
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

  // Public API methods
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

  async releaseWakeLock(): Promise<void> {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
    }
  }

  stopVibration(): boolean {
    if (!this.capabilities.vibration) return false;
    return navigator.vibrate(0);
  }

  async requestBluetoothDevice(): Promise<BluetoothDevice | null> {
    if (!this.capabilities.bluetooth) {
      console.warn('Web Bluetooth not supported');
      return null;
    }

    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{
          name: SOTERIA_BLE_CONFIG.deviceName,
          services: [SOTERIA_BLE_CONFIG.serviceUUID]
        }]
      });
      return device;
    } catch (error) {
      console.error('Error requesting Bluetooth device:', error);
      return null;
    }
  }

  async connectBluetoothDevice(device: BluetoothDevice): Promise<BluetoothRemoteGATTServer | null> {
    try {
      return await device.gatt?.connect() || null;
    } catch (error) {
      console.error('Error connecting to Bluetooth device:', error);
      return null;
    }
  }

  async subscribeToPanicButton(device: BluetoothDevice): Promise<boolean> {
    try {
      await this.setupPanicButtonListener(device, device.gatt as any);
      return true;
    } catch (error) {
      console.error('Error subscribing to panic button:', error);
      return false;
    }
  }

  async sendFeedbackToBLEDevice(device: BluetoothDevice, feedbackType: 'vibrate' | 'led'): Promise<boolean> {
    return this.sendDeviceFeedback(device, feedbackType);
  }

  vibrate(options: VibrationOptions): boolean {
    return this.vibrateEmergencyPattern('custom', options.pattern);
  }

  async requestWakeLock(): Promise<boolean> {
    return this.requestEmergencyWakeLock();
  }

  async saveFile(data: Blob, filename: string): Promise<void> {
    const type = filename.includes('video') ? 'video' : filename.includes('audio') ? 'audio' : 'photo';
    return this.saveEmergencyFile(data, filename, type);
  }

  createPeerConnection(configuration?: RTCConfiguration): RTCPeerConnection | null {
    return this.createEmergencyRTCConnection(configuration);
  }
}

export const nativeAPIManager = new NativeAPIManager();
