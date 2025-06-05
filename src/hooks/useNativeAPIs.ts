import { useState, useEffect, useCallback } from 'react';
import { nativeAPIManager, APICapabilities } from '@/services/NativeAPIManager';
import { emergencyRecordingService, RecordingOptions } from '@/services/EmergencyRecordingService';
import { emergencyWebRTCService, CallOptions } from '@/services/EmergencyWebRTCService';
import { useToast } from '@/hooks/use-toast';

export function useNativeAPIs() {
  const { toast } = useToast();
  const [capabilities, setCapabilities] = useState<APICapabilities>(nativeAPIManager.getCapabilities());
  const [permissions, setPermissions] = useState<{ [key: string]: boolean }>({});
  const [isRecording, setIsRecording] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [connectedBLEDevice, setConnectedBLEDevice] = useState<BluetoothDevice | null>(null);
  const [nfcReading, setNfcReading] = useState(false);

  useEffect(() => {
    // Update capabilities on mount
    setCapabilities(nativeAPIManager.getCapabilities());
  }, []);

  // Request all permissions
  const requestPermissions = useCallback(async () => {
    try {
      const results = await nativeAPIManager.requestAllPermissions();
      setPermissions(results);
      
      const granted = Object.values(results).filter(Boolean).length;
      const total = Object.keys(results).length;
      
      toast({
        title: "Permissions Updated",
        description: `${granted}/${total} permissions granted for emergency features.`,
      });
      
      return results;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      toast({
        title: "Permission Error",
        description: "Some emergency features may not work properly.",
        variant: "destructive"
      });
      return {};
    }
  }, [toast]);

  // Location services
  const getCurrentLocation = useCallback(async () => {
    try {
      return await nativeAPIManager.getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 15000
      });
    } catch (error) {
      console.error('Location error:', error);
      toast({
        title: "Location Error",
        description: "Unable to get your current location.",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  // Recording services
  const startEmergencyRecording = useCallback(async (options: RecordingOptions) => {
    try {
      const recordingId = await emergencyRecordingService.startRecording({
        ...options,
        stealth: true // Always stealth in emergency mode
      });
      
      if (recordingId) {
        setIsRecording(true);
        toast({
          title: "Recording Started",
          description: `Emergency ${options.type} recording activated.`,
        });
      }
      
      return recordingId;
    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: "Recording Error",
        description: "Unable to start emergency recording.",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  const stopRecording = useCallback((recordingId: string) => {
    const success = emergencyRecordingService.stopRecording(recordingId);
    if (success) {
      setIsRecording(false);
      toast({
        title: "Recording Stopped",
        description: "Emergency recording saved securely.",
      });
    }
    return success;
  }, [toast]);

  // Emergency call
  const startEmergencyCall = useCallback(async (options: CallOptions = {}) => {
    try {
      const success = await emergencyWebRTCService.initializeCall({
        audio: true,
        video: false,
        emergency: true,
        ...options
      });
      
      if (success) {
        toast({
          title: "Emergency Call",
          description: "Connecting to emergency services...",
        });
      }
      
      return success;
    } catch (error) {
      console.error('Emergency call error:', error);
      toast({
        title: "Call Error",
        description: "Unable to connect to emergency services.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  // Vibration
  const triggerEmergencyVibration = useCallback(() => {
    return nativeAPIManager.vibrate({
      pattern: [200, 100, 200, 100, 200], // SOS pattern
      intensity: 'heavy'
    });
  }, []);

  // Wake lock
  const activateWakeLock = useCallback(async () => {
    const success = await nativeAPIManager.requestWakeLock();
    setWakeLockActive(success);
    
    if (success) {
      toast({
        title: "Screen Lock Activated",
        description: "Screen will stay on during emergency.",
      });
    }
    
    return success;
  }, [toast]);

  const releaseWakeLock = useCallback(async () => {
    await nativeAPIManager.releaseWakeLock();
    setWakeLockActive(false);
  }, []);

  // Notifications
  const sendEmergencyNotification = useCallback(async (title: string, message: string) => {
    try {
      await nativeAPIManager.showNotification(title, {
        body: message,
        requireInteraction: true,
        vibrate: [200, 100, 200],
        actions: [
          { action: 'view', title: 'View' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      });
    } catch (error) {
      console.error('Notification error:', error);
    }
  }, []);

  // Background sync
  const syncEmergencyData = useCallback(async () => {
    return await nativeAPIManager.registerBackgroundSync('emergency-sync');
  }, []);

  // Bluetooth (when you provide device info)
  const connectEmergencyDevice = useCallback(async () => {
    try {
      const device = await nativeAPIManager.requestBluetoothDevice({
        // Will be populated when you provide device UUIDs
        acceptAllDevices: true
      });
      
      if (device) {
        const server = await nativeAPIManager.connectBluetoothDevice(device);
        toast({
          title: "Device Connected",
          description: `Connected to ${device.name || 'Emergency Device'}`,
        });
        return server;
      }
    } catch (error) {
      console.error('Bluetooth error:', error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to emergency device.",
        variant: "destructive"
      });
    }
    return null;
  }, [toast]);

  // Enhanced Bluetooth functionality with Soteria specs
  const connectSoteriaDevice = useCallback(async () => {
    try {
      const device = await nativeAPIManager.requestBluetoothDevice();
      
      if (device) {
        const server = await nativeAPIManager.connectBluetoothDevice(device);
        
        if (server) {
          // Subscribe to panic button notifications
          const success = await nativeAPIManager.subscribeToPanicButton(device);
          
          if (success) {
            setConnectedBLEDevice(device);
            toast({
              title: "Soteria Device Connected",
              description: `Connected to ${device.name}. Panic button is now active.`,
            });
          }
        }
        
        return server;
      }
    } catch (error) {
      console.error('Soteria BLE connection error:', error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to Soteria safety device.",
        variant: "destructive"
      });
    }
    return null;
  }, [toast]);

  const sendBLEFeedback = useCallback(async (feedbackType: 'vibrate' | 'led') => {
    if (!connectedBLEDevice) {
      toast({
        title: "No Device Connected",
        description: "Please connect a Soteria device first.",
        variant: "destructive"
      });
      return false;
    }

    const success = await nativeAPIManager.sendFeedbackToBLEDevice(connectedBLEDevice, feedbackType);
    
    if (success) {
      toast({
        title: "Feedback Sent",
        description: `${feedbackType === 'vibrate' ? 'Vibration' : 'LED'} signal sent to device.`,
      });
    }
    
    return success;
  }, [connectedBLEDevice, toast]);

  // NFC functionality with Soteria specs
  const startNFCReading = useCallback(async () => {
    if (!nativeAPIManager.isFeatureSupported('nfc')) {
      toast({
        title: "NFC Not Supported",
        description: "Your device doesn't support NFC reading.",
        variant: "destructive"
      });
      return;
    }

    try {
      setNfcReading(true);
      
      toast({
        title: "NFC Reader Active",
        description: "Hold a Soteria NFC tag near your device...",
      });

      const payload = await nativeAPIManager.readNFCTag();
      
      if (payload) {
        await nativeAPIManager.handleNFCAction(payload);
        
        toast({
          title: "NFC Tag Detected",
          description: `Action: ${payload.soteria_action} from device ${payload.device_id}`,
        });
      }
    } catch (error) {
      console.error('NFC reading error:', error);
      toast({
        title: "NFC Error",
        description: "Unable to read NFC tag.",
        variant: "destructive"
      });
    } finally {
      setNfcReading(false);
    }
  }, [toast]);

  // Event listeners for BLE/NFC triggers
  useEffect(() => {
    const handleBLEEmergency = (event: CustomEvent) => {
      console.log('BLE emergency triggered:', event.detail);
      toast({
        title: "EMERGENCY ACTIVATED",
        description: "Panic button pressed! Starting emergency protocol...",
        variant: "destructive"
      });
      
      // Trigger emergency protocol
      document.dispatchEvent(new CustomEvent('emergencyActivated', {
        detail: { source: 'ble', ...event.detail }
      }));
    };

    const handleNFCEmergency = (event: CustomEvent) => {
      console.log('NFC emergency triggered:', event.detail);
      toast({
        title: "EMERGENCY ACTIVATED",
        description: "NFC tag scanned! Starting emergency protocol...",
        variant: "destructive"
      });
      
      // Trigger emergency protocol
      document.dispatchEvent(new CustomEvent('emergencyActivated', {
        detail: { source: 'nfc', ...event.detail }
      }));
    };

    const handleNFCCancel = (event: CustomEvent) => {
      console.log('NFC cancel triggered:', event.detail);
      toast({
        title: "Emergency Cancelled",
        description: "Emergency protocol cancelled via NFC tag.",
      });
      
      document.dispatchEvent(new CustomEvent('emergencyCancelled', {
        detail: { source: 'nfc', ...event.detail }
      }));
    };

    const handleNFCStatus = (event: CustomEvent) => {
      console.log('NFC status check:', event.detail);
      toast({
        title: "System Status",
        description: "Emergency system ready and operational.",
      });
    };

    document.addEventListener('bleEmergencyTrigger', handleBLEEmergency as EventListener);
    document.addEventListener('nfcEmergencyActivate', handleNFCEmergency as EventListener);
    document.addEventListener('nfcEmergencyCancel', handleNFCCancel as EventListener);
    document.addEventListener('nfcStatusCheck', handleNFCStatus as EventListener);

    return () => {
      document.removeEventListener('bleEmergencyTrigger', handleBLEEmergency as EventListener);
      document.removeEventListener('nfcEmergencyActivate', handleNFCEmergency as EventListener);
      document.removeEventListener('nfcEmergencyCancel', handleNFCCancel as EventListener);
      document.removeEventListener('nfcStatusCheck', handleNFCStatus as EventListener);
    };
  }, [toast]);

  return {
    // State
    capabilities,
    permissions,
    isRecording,
    wakeLockActive,
    
    // Actions
    requestPermissions,
    getCurrentLocation,
    startEmergencyRecording,
    stopRecording,
    startEmergencyCall,
    triggerEmergencyVibration,
    activateWakeLock,
    releaseWakeLock,
    sendEmergencyNotification,
    syncEmergencyData,
    connectEmergencyDevice,
    
    // Enhanced Bluetooth/NFC actions
    connectSoteriaDevice,
    sendBLEFeedback,
    startNFCReading,
    connectedBLEDevice,
    nfcReading,
    
    // Utilities
    isFeatureSupported: nativeAPIManager.isFeatureSupported.bind(nativeAPIManager),
    getRecordings: emergencyRecordingService.getRecordings.bind(emergencyRecordingService)
  };
}
