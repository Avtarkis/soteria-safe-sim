
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
    
    // Utilities
    isFeatureSupported: nativeAPIManager.isFeatureSupported.bind(nativeAPIManager),
    getRecordings: emergencyRecordingService.getRecordings.bind(emergencyRecordingService)
  };
}
