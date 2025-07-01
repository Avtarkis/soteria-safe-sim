import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DetectionMode, DetectionState, DetectionAlert } from '@/types/detection';

// Generate a simple UUID function instead of importing the library
const generateId = () => {
  return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Sample detection patterns for testing
const detectionPatterns = {
  gunshot: /gunshot|firearm|shooting|shooter|gun/i,
  knife: /knife|blade|stab/i,
  bomb: /bomb|explosion|explosive|detonate/i,
  general: /weapon|danger|threat|attack|emergency|help/i
};

// Default state for the detection system
const defaultDetectionState: DetectionState = {
  isActive: false,
  detectionMode: 'balanced',
  sensitivityLevel: 2,
  sensors: {
    motion: { active: false, status: 'Ready' },
    audio: { active: false, status: 'Ready' },
    radioSignal: { active: false, status: 'Ready' },
    ai: { active: false, status: 'Ready' }
  },
  detectionStatus: { 
    level: 0, 
    message: 'Normal', 
    lastUpdate: new Date().toISOString() 
  },
  alerts: [],
  lastAlert: null
};

export const useWeaponDetection = () => {
  // State for the detection system
  const [detectionState, setDetectionState] = useState<DetectionState>(defaultDetectionState);
  
  // Audio context and analyzer references
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  
  // Timer references
  const motionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const radioScanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Toast notifications
  const { toast } = useToast();

  // Initialize detection system when activated
  useEffect(() => {
    if (detectionState.isActive) {
      initializeDetectionSystem();
      return () => {
        cleanupDetectionSystem();
      };
    } else {
      cleanupDetectionSystem();
    }
  }, [detectionState.isActive]);

  // Apply detection mode changes
  useEffect(() => {
    if (detectionState.isActive) {
      configureSensorsBasedOnMode();
    }
  }, [detectionState.detectionMode, detectionState.isActive]);

  // Initialize detection system
  const initializeDetectionSystem = useCallback(() => {
    console.log('Initializing weapon detection system');
    
    // Start with sensors inactive
    setDetectionState(prev => ({
      ...prev,
      sensors: {
        motion: { active: false, status: 'Initializing...' },
        audio: { active: false, status: 'Initializing...' },
        radioSignal: { active: false, status: 'Initializing...' },
        ai: { active: false, status: 'Initializing...' }
      }
    }));
    
    // Initialize sensors with a slight delay to show progress
    setTimeout(() => initializeMotionDetection(), 500);
    setTimeout(() => initializeAudioDetection(), 1000);
    setTimeout(() => initializeRadioDetection(), 1500);
    setTimeout(() => initializeAIProcessing(), 2000);
    
    // Set overall status
    setTimeout(() => {
      setDetectionState(prev => ({
        ...prev,
        detectionStatus: {
          level: 0,
          message: 'Monitoring',
          lastUpdate: new Date().toISOString()
        }
      }));
    }, 2500);
  }, []);

  // Initialize motion detection (accelerometer/gyroscope)
  const initializeMotionDetection = useCallback(() => {
    // Check if device motion events are supported
    if ('DeviceMotionEvent' in window) {
      setDetectionState(prev => ({
        ...prev,
        sensors: {
          ...prev.sensors,
          motion: { active: true, status: 'Monitoring movement' }
        }
      }));
      
      // Simulate periodic motion checks
      motionIntervalRef.current = setInterval(() => {
        // In a real implementation, we would analyze actual motion data here
        console.log('Motion detection running');
      }, 10000);
    } else {
      setDetectionState(prev => ({
        ...prev,
        sensors: {
          ...prev.sensors,
          motion: { active: false, status: 'Not supported on this device' }
        }
      }));
    }
  }, []);

  // Initialize audio detection
  const initializeAudioDetection = useCallback(async () => {
    try {
      // Request microphone permission
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Audio API not supported');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneStreamRef.current = stream;
      
      // Create audio context and analyzer
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      // Connect microphone to analyzer
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Configure analyzer
      analyserRef.current.fftSize = 2048;
      
      setDetectionState(prev => ({
        ...prev,
        sensors: {
          ...prev.sensors,
          audio: { active: true, status: 'Monitoring audio' }
        }
      }));
      
      // In a real implementation, we would analyze the audio data here
      console.log('Audio detection initialized');
    } catch (error) {
      console.error('Error initializing audio detection:', error);
      setDetectionState(prev => ({
        ...prev,
        sensors: {
          ...prev.sensors,
          audio: { active: false, status: 'Permission denied or not available' }
        }
      }));
    }
  }, []);

  // Initialize radio frequency detection
  const initializeRadioDetection = useCallback(() => {
    // In a real implementation, this would use Bluetooth/WiFi scanning
    // Simulated for demonstration purposes
    setDetectionState(prev => ({
      ...prev,
      sensors: {
        ...prev.sensors,
        radioSignal: { active: true, status: 'Scanning for signals' }
      }
    }));
    
    radioScanIntervalRef.current = setInterval(() => {
      // Simulate periodic radio scans
      console.log('Radio scan running');
    }, 15000);
  }, []);

  // Initialize AI processing
  const initializeAIProcessing = useCallback(() => {
    // In a real implementation, this would load ML models
    // Simulated for demonstration purposes
    setDetectionState(prev => ({
      ...prev,
      sensors: {
        ...prev.sensors,
        ai: { active: true, status: 'Processing sensor data' }
      }
    }));
    
    console.log('AI processing initialized');
  }, []);

  // Configure sensors based on detection mode
  const configureSensorsBasedOnMode = useCallback(() => {
    const { detectionMode } = detectionState;
    
    switch (detectionMode) {
      case 'passive':
        // Passive mode uses minimal sensors
        setDetectionState(prev => ({
          ...prev,
          sensors: {
            motion: { active: true, status: 'Low power monitoring' },
            audio: { active: true, status: 'Low sampling rate' },
            radioSignal: { active: false, status: 'Disabled in passive mode' },
            ai: { active: true, status: 'Basic processing only' }
          }
        }));
        break;
        
      case 'balanced':
        // Balanced mode uses all sensors with moderate settings
        setDetectionState(prev => ({
          ...prev,
          sensors: {
            motion: { active: true, status: 'Standard monitoring' },
            audio: { active: true, status: 'Active monitoring' },
            radioSignal: { active: true, status: 'Periodic scanning' },
            ai: { active: true, status: 'Standard processing' }
          }
        }));
        break;
        
      case 'aggressive':
        // Aggressive mode uses all sensors with maximum sensitivity
        setDetectionState(prev => ({
          ...prev,
          sensors: {
            motion: { active: true, status: 'High sensitivity' },
            audio: { active: true, status: 'Continuous analysis' },
            radioSignal: { active: true, status: 'Active scanning' },
            ai: { active: true, status: 'Enhanced processing' }
          }
        }));
        break;
    }
  }, [detectionState.detectionMode]);

  // Clean up detection system
  const cleanupDetectionSystem = useCallback(() => {
    console.log('Cleaning up weapon detection system');
    
    // Stop audio processing
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      microphoneStreamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // Clear intervals
    if (motionIntervalRef.current) {
      clearInterval(motionIntervalRef.current);
      motionIntervalRef.current = null;
    }
    
    if (radioScanIntervalRef.current) {
      clearInterval(radioScanIntervalRef.current);
      radioScanIntervalRef.current = null;
    }
    
    // Reset sensor states
    setDetectionState(prev => ({
      ...prev,
      sensors: {
        motion: { active: false, status: 'Ready' },
        audio: { active: false, status: 'Ready' },
        radioSignal: { active: false, status: 'Ready' },
        ai: { active: false, status: 'Ready' }
      },
      detectionStatus: { 
        level: 0, 
        message: 'Normal', 
        lastUpdate: new Date().toISOString() 
      }
    }));
  }, []);

  // Toggle detection system
  const toggleDetection = useCallback(() => {
    setDetectionState(prev => ({
      ...prev,
      isActive: !prev.isActive
    }));
  }, []);

  // Set detection mode
  const setDetectionMode = useCallback((mode: DetectionMode) => {
    setDetectionState(prev => ({
      ...prev,
      detectionMode: mode
    }));
  }, []);

  // Set sensitivity level
  const setSensitivityLevel = useCallback((level: number) => {
    setDetectionState(prev => ({
      ...prev,
      sensitivityLevel: level
    }));
  }, []);

  // Trigger a test alert for demonstration
  const triggerTestAlert = useCallback(() => {
    // Create a test alert
    const testAlert: DetectionAlert = {
      id: generateId(),
      title: 'Test Alert',
      description: 'This is a test of the weapon detection system.',
      level: detectionState.sensitivityLevel as 1 | 2 | 3,
      timestamp: new Date().toISOString(),
      confidence: 0.85,
      verified: true
    };
    
    // Add alert to state
    setDetectionState(prev => ({
      ...prev,
      alerts: [testAlert, ...prev.alerts],
      lastAlert: testAlert,
      detectionStatus: {
        level: testAlert.level,
        message: 'Test alert triggered',
        lastUpdate: new Date().toISOString()
      }
    }));
    
    // Show notification
    toast({
      title: 'Test Alert',
      description: 'Weapon detection alert simulated successfully.',
      variant: 'destructive'
    });
    
    // Create voice alert
    speakAlert('This is a test. Dangerous weapons detected nearby. Stay safe please.');
    
    // Vibrate device if supported
    if ('vibrate' in navigator) {
      // Vibration pattern: 500ms on, 200ms off, repeat
      navigator.vibrate([500, 200, 500]);
    }
    
    // Reset status after delay
    setTimeout(() => {
      setDetectionState(prev => ({
        ...prev,
        detectionStatus: {
          level: 0,
          message: 'Monitoring',
          lastUpdate: new Date().toISOString()
        }
      }));
    }, 5000);
  }, [detectionState.sensitivityLevel, toast]);

  // Function to speak alerts using Web Speech API
  const speakAlert = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      speechSynthesis.speak(utterance);
    }
  }, []);

  return {
    ...detectionState,
    toggleDetection,
    setDetectionMode,
    setSensitivityLevel,
    triggerTestAlert
  };
};

export default useWeaponDetection;
