
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AIThreatDetection } from '@/types/ai-monitoring';
import emergencyCallService from './emergencyCallService';
import { emergencyAlertService } from './EmergencyAlertService';

// Define system status type
interface SecureDefenseStatus {
  isActive: boolean;
  emergencyMode: boolean;
  stealthMode: boolean;
  recordingActive: boolean;
  recordingType: 'video' | 'audio' | 'photo' | null;
  lastDetection: Date | null;
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

// Context for the secure defense system
interface SecureDefenseContextType {
  status: SecureDefenseStatus;
  activateSecurity: () => Promise<void>;
  deactivateSecurity: () => void;
  triggerEmergency: (threatDetails?: Partial<AIThreatDetection>) => void;
  endEmergency: () => void;
}

const SecureDefenseContext = createContext<SecureDefenseContextType | null>(null);

// Provider component
export const SecureDefenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<SecureDefenseStatus>({
    isActive: false,
    emergencyMode: false,
    stealthMode: false,
    recordingActive: false,
    recordingType: null,
    lastDetection: null,
    threatLevel: 'none',
  });

  // Initialize and cleanup
  useEffect(() => {
    // Any initialization code here
    return () => {
      // Cleanup
      if (status.recordingActive) {
        stopRecording();
      }
    };
  }, []);

  // Helper function to stop recording
  const stopRecording = () => {
    // Implement recording stopping logic
    console.log('Stopping recording...');
    setStatus(prev => ({
      ...prev,
      recordingActive: false,
      recordingType: null,
    }));
  };

  // Activate the security system
  const activateSecurity = async () => {
    console.log('Activating security system...');
    
    // Request necessary permissions
    try {
      // Request camera and microphone permissions if needed
      // This is just an example, actual implementation depends on browser APIs
      const cameraPermission = await navigator.mediaDevices.getUserMedia({ video: true });
      const micPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stop the streams immediately after getting permissions
      cameraPermission.getTracks().forEach(track => track.stop());
      micPermission.getTracks().forEach(track => track.stop());
      
      setStatus(prev => ({
        ...prev,
        isActive: true,
      }));
      
      toast({
        title: "Security System Activated",
        description: "Your device is now being monitored for threats.",
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error activating security system:', error);
      toast({
        title: "Security System Activation Failed",
        description: "Unable to get required permissions. Please try again.",
        variant: "destructive",
      });
      
      return Promise.reject(error);
    }
  };
  
  // Deactivate the security system
  const deactivateSecurity = () => {
    console.log('Deactivating security system...');
    
    if (status.emergencyMode) {
      endEmergency();
    }
    
    setStatus({
      isActive: false,
      emergencyMode: false,
      stealthMode: false,
      recordingActive: false,
      recordingType: null,
      lastDetection: null,
      threatLevel: 'none',
    });
    
    toast({
      title: "Security System Deactivated",
      description: "Threat monitoring has been turned off.",
    });
  };

  // Trigger emergency mode
  const triggerEmergency = (threatDetails?: Partial<AIThreatDetection>) => {
    console.log('TRIGGERING EMERGENCY MODE');
    
    // Default threat if none provided
    const threat: AIThreatDetection = {
      id: `threat-${Date.now()}`,
      type: threatDetails?.type || 'security',
      subtype: threatDetails?.subtype || 'manual',
      severity: threatDetails?.severity || 'high',
      confidence: 0.95,
      description: threatDetails?.description || 'Emergency mode manually activated',
      recommendedAction: threatDetails?.recommendedAction || 'Contact emergency services',
      automaticResponseTaken: 'Emergency mode activated',
      timestamp: Date.now(),
      details: threatDetails?.details || 'User triggered emergency mode',
      source: 'manual',
    };
    
    // Activate stealth mode for high severity threats
    const activateStealthMode = threat.severity === 'critical' || threat.severity === 'high';
    
    // Start recording
    const recordingType = threat.type === 'security' ? 'video' : 'audio';
    
    // Update status
    setStatus(prev => ({
      ...prev,
      emergencyMode: true,
      stealthMode: activateStealthMode,
      recordingActive: true,
      recordingType,
      lastDetection: new Date(),
      threatLevel: threat.severity || 'high',
    }));
    
    // Start emergency call simulation for testing
    if (!emergencyCallService.isCallInProgress()) {
      const callType = threat.type === 'security' ? 'weapon' : 
                     threat.type === 'health' ? 'health' : 'default';
                     
      emergencyCallService.startEmergencyCall(callType, {
        callerName: 'Emergency Response',
        autoAnswerDelay: 3000,
      });
    }
    
    // Send emergency alerts
    emergencyAlertService.sendEmergencyAlerts({
      emergency_type: threat.type || 'security',
      location: [0, 0], // Replace with actual coordinates
      timestamp: new Date().toISOString(),
      send_media: true,
      recipients: 'all',
      alert_method: 'all',
    });
    
    // Show emergency toast notification
    toast({
      title: "🚨 EMERGENCY MODE ACTIVATED",
      description: "Emergency contacts are being notified. Stay safe.",
      variant: "destructive",
      duration: 10000,
    });
  };

  // End emergency mode
  const endEmergency = () => {
    console.log('Ending emergency mode...');
    
    // Stop recording if active
    if (status.recordingActive) {
      stopRecording();
    }
    
    // End emergency call if in progress
    if (emergencyCallService.isCallInProgress()) {
      emergencyCallService.endEmergencyCall();
    }
    
    // Send all clear alert
    emergencyAlertService.sendAllClearAlert();
    
    // Update status
    setStatus(prev => ({
      ...prev,
      emergencyMode: false,
      stealthMode: false,
      recordingActive: false,
      recordingType: null,
      threatLevel: 'none',
    }));
    
    // Show toast notification
    toast({
      title: "Emergency Mode Deactivated",
      description: "All clear signal sent to your emergency contacts.",
    });
  };

  // The value provided to consumers
  const value = {
    status,
    activateSecurity,
    deactivateSecurity,
    triggerEmergency,
    endEmergency,
  };

  return (
    <SecureDefenseContext.Provider value={value}>
      {children}
    </SecureDefenseContext.Provider>
  );
};

// Custom hook to use the context
export const useSecureDefense = () => {
  const context = useContext(SecureDefenseContext);
  if (!context) {
    throw new Error('useSecureDefense must be used within a SecureDefenseProvider');
  }
  return context;
};

// Default export for the provider
export default SecureDefenseProvider;
