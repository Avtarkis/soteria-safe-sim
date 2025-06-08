
import { useState, useEffect, useCallback } from 'react';
import { nativeAPIManager, APICapabilities } from '@/services/NativeAPIManager';
import { emergencyWebRTCService, CallOptions } from '@/services/EmergencyWebRTCService';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from './usePermissions';
import { useEmergencyRecording } from './useEmergencyRecording';
import { useBluetoothDevices } from './useBluetoothDevices';

export function useNativeAPIs() {
  const { toast } = useToast();
  const [capabilities, setCapabilities] = useState<APICapabilities>(nativeAPIManager.getCapabilities());
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [nfcReading, setNfcReading] = useState(false);

  const { permissions, requestPermissions } = usePermissions();
  const { isRecording, startEmergencyRecording, stopRecording, getRecordings } = useEmergencyRecording();
  const { connectedBLEDevice, connectSoteriaDevice, sendBLEFeedback } = useBluetoothDevices();

  useEffect(() => {
    setCapabilities(nativeAPIManager.getCapabilities());
  }, []);

  const getCurrentLocation = useCallback(async () => {
    try {
      return await nativeAPIManager.getCurrentPosition({
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

  const triggerEmergencyVibration = useCallback(() => {
    return nativeAPIManager.vibrate({
      pattern: [200, 100, 200, 100, 200],
      intensity: 'heavy'
    });
  }, []);

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

  return {
    capabilities,
    permissions,
    isRecording,
    wakeLockActive,
    connectedBLEDevice,
    nfcReading,
    
    requestPermissions,
    getCurrentLocation,
    startEmergencyRecording,
    stopRecording,
    startEmergencyCall,
    triggerEmergencyVibration,
    activateWakeLock,
    releaseWakeLock,
    connectSoteriaDevice,
    sendBLEFeedback,
    
    isFeatureSupported: nativeAPIManager.isFeatureSupported.bind(nativeAPIManager),
    getRecordings
  };
}
