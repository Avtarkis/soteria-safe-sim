
import { useCallback, useState } from 'react';
import emergencyCallService, { EmergencyCallType, SimulatedCallOptions } from '@/services/emergencyCallService';

export const useEmergencyCall = () => {
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  
  // Update local state when checking if call is active
  const checkCallStatus = useCallback(() => {
    const status = emergencyCallService.isCallInProgress();
    setIsCallActive(status);
    return status;
  }, []);
  
  // Start an emergency call
  const startEmergencyCall = useCallback((
    callType: EmergencyCallType = 'default',
    options: SimulatedCallOptions = {}
  ) => {
    // Make sure we update our local state when the call completes
    const enhancedOptions = {
      ...options,
      onComplete: () => {
        setIsCallActive(false);
        if (options.onComplete) options.onComplete();
      },
      onCancel: () => {
        setIsCallActive(false);
        if (options.onCancel) options.onCancel();
      }
    };
    
    emergencyCallService.startEmergencyCall(callType, enhancedOptions);
    setIsCallActive(true);
  }, []);
  
  // End an active emergency call
  const endEmergencyCall = useCallback(() => {
    emergencyCallService.endEmergencyCall();
    setIsCallActive(false);
  }, []);
  
  return {
    isCallActive: checkCallStatus(),
    startEmergencyCall,
    endEmergencyCall
  };
};
