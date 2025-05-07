
import React, { useState, useEffect } from 'react';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import { toast } from '@/hooks/use-toast';
import { Phone, X, Volume2, Mic } from 'lucide-react';

interface PhoneCallSimulatorProps {
  callerName: string;
  message: string;
  onComplete: () => void;
  onCancel?: () => void;
  autoAnswerDelay?: number; // in milliseconds
}

const PhoneCallSimulator: React.FC<PhoneCallSimulatorProps> = ({
  callerName,
  message,
  onComplete,
  onCancel,
  autoAnswerDelay = 5000, // Default 5 seconds
}) => {
  const [callState, setCallState] = useState<'ringing' | 'answered' | 'completed'>('ringing');
  const [callDuration, setCallDuration] = useState(0);
  const { speak, isSpeaking, stop } = useTextToSpeech();
  const [vibrationInterval, setVibrationInterval] = useState<number | null>(null);

  // Start vibration pattern when call is incoming
  useEffect(() => {
    if (callState === 'ringing') {
      // Start vibration pattern (if available in browser)
      if ('vibrate' in navigator) {
        // Vibrate pattern: 500ms vibrate, 200ms pause, repeat
        const interval = window.setInterval(() => {
          navigator.vibrate(500);
        }, 700);
        setVibrationInterval(interval);
      }

      // Play ringtone
      const audio = new Audio('/sounds/emergency-ring.mp3');
      audio.loop = true;
      audio.play().catch(err => console.error('Error playing ringtone:', err));

      // Set up auto-answer
      const autoAnswerTimer = setTimeout(() => {
        handleAnswerCall();
      }, autoAnswerDelay);

      return () => {
        if (vibrationInterval) clearInterval(vibrationInterval);
        audio.pause();
        audio.currentTime = 0;
        clearTimeout(autoAnswerTimer);
      };
    }
  }, [callState, autoAnswerDelay]);

  // Handle call duration timer
  useEffect(() => {
    let durationTimer: number | null = null;
    
    if (callState === 'answered') {
      durationTimer = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (durationTimer) clearInterval(durationTimer);
    };
  }, [callState]);

  // Play message when call is answered
  useEffect(() => {
    if (callState === 'answered' && !isSpeaking) {
      // Small delay before speaking to simulate real call connection
      const speechTimer = setTimeout(() => {
        speak(message, {
          voice: 'deep-male', // Use a voice that sounds like police/authority
          pitch: 0.9,
          speed: 0.95
        }).catch(err => {
          console.error('Error during speech:', err);
          // Fallback to browser's text-to-speech if available
          const utterance = new SpeechSynthesisUtterance(message);
          utterance.rate = 0.95;
          utterance.pitch = 0.9;
          window.speechSynthesis.speak(utterance);
        });
      }, 800);

      return () => clearTimeout(speechTimer);
    }
  }, [callState, message, speak, isSpeaking]);

  // When speech finishes, wait a moment then complete the call
  useEffect(() => {
    if (callState === 'answered' && !isSpeaking && callDuration > 3) {
      const endCallTimer = setTimeout(() => {
        setCallState('completed');
        onComplete();
      }, 2000);

      return () => clearTimeout(endCallTimer);
    }
  }, [callState, isSpeaking, callDuration, onComplete]);

  const handleAnswerCall = () => {
    if (callState !== 'ringing') return;

    // Stop vibration and ringtone
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
      if (vibrationInterval) clearInterval(vibrationInterval);
    }

    setCallState('answered');

    // Attempt to increase volume to maximum
    try {
      // This will only work if the device allows it and the user has granted permissions
      const audioContext = new AudioContext();
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 1.0; // Maximum volume
      gainNode.connect(audioContext.destination);
    } catch (error) {
      console.warn('Could not adjust volume:', error);
    }

    // Show toast notification that call has been answered
    toast({
      title: "Emergency Call Connected",
      description: "Police emergency response is active",
    });
  };

  const handleRejectCall = () => {
    if (callState !== 'ringing') return;
    
    // Stop vibration and ringtone
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
      if (vibrationInterval) clearInterval(vibrationInterval);
    }

    if (onCancel) onCancel();
  };

  const handleEndCall = () => {
    stop(); // Stop any ongoing speech
    setCallState('completed');
    onComplete();
  };

  // Format call duration as mm:ss
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // If call is completed, don't render anything
  if (callState === 'completed') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col items-center justify-between p-6 animate-in fade-in duration-300">
      {/* Caller information */}
      <div className="flex flex-col items-center mt-8">
        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <Phone className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{callerName}</h2>
        
        {callState === 'ringing' ? (
          <p className="text-white/80">Incoming call...</p>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-white/80">Call in progress</p>
            <p className="text-white/60 text-lg mt-2">{formatDuration(callDuration)}</p>
            
            {/* Display indicator when speaking */}
            {isSpeaking && (
              <div className="flex items-center gap-2 mt-4 bg-primary/20 px-4 py-2 rounded-full">
                <Volume2 className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-primary">Emergency message playing...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Call actions */}
      <div className="w-full mb-12">
        {callState === 'ringing' ? (
          <div className="flex justify-center gap-24">
            {/* Reject button */}
            <button 
              onClick={handleRejectCall}
              className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center"
            >
              <X className="w-8 h-8 text-white" />
            </button>
            
            {/* Answer button */}
            <button
              onClick={handleAnswerCall}
              className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center animate-pulse"
            >
              <Phone className="w-8 h-8 text-white" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            {/* End call button */}
            <button
              onClick={handleEndCall}
              className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center"
            >
              <X className="w-8 h-8 text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneCallSimulator;
