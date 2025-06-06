
import { useState, useCallback, useEffect } from 'react';
import { nativeAPIManager } from '@/services/NativeAPIManager';
import { useToast } from '@/hooks/use-toast';

export function useBluetoothDevices() {
  const { toast } = useToast();
  const [connectedBLEDevice, setConnectedBLEDevice] = useState<BluetoothDevice | null>(null);

  const connectSoteriaDevice = useCallback(async () => {
    try {
      const device = await nativeAPIManager.requestBluetoothDevice();
      
      if (device) {
        const server = await nativeAPIManager.connectBluetoothDevice(device);
        
        if (server) {
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

  useEffect(() => {
    const handleBLEEmergency = (event: CustomEvent) => {
      console.log('BLE emergency triggered:', event.detail);
      toast({
        title: "EMERGENCY ACTIVATED",
        description: "Panic button pressed! Starting emergency protocol...",
        variant: "destructive"
      });
      
      document.dispatchEvent(new CustomEvent('emergencyActivated', {
        detail: { source: 'ble', ...event.detail }
      }));
    };

    document.addEventListener('bleEmergencyTrigger', handleBLEEmergency as EventListener);

    return () => {
      document.removeEventListener('bleEmergencyTrigger', handleBLEEmergency as EventListener);
    };
  }, [toast]);

  return {
    connectedBLEDevice,
    connectSoteriaDevice,
    sendBLEFeedback
  };
}
