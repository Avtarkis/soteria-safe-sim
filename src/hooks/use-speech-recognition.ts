import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from './use-toast';
import { NetworkStatus, connectivityService } from '@/utils/voice/connectivity';

interface SpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<'poor' | 'online' | 'offline'>('online');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleNetworkChange = (status: NetworkStatus) => {
      if (status.quality === 'poor') {
        setNetworkStatus('poor');
      } else {
        setNetworkStatus(status.isOnline ? 'online' : 'offline');
      }
    };

    // Subscribe to network status changes
    const checkStatus = () => {
      const status = connectivityService.getCurrentStatus();
      handleNetworkChange(status);
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported');
      return false;
    }

    try {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognitionRef.current = recognition;

      recognition.lang = options.lang || 'en-US';
      recognition.continuous = options.continuous !== false;
      recognition.interimResults = options.interimResults !== false;

      recognition.onresult = (event) => {
        const newTranscript = Array.from(event.results)
          .map((result) => result[0])
          .map((speechRecognitionResult) => speechRecognitionResult.transcript)
          .join('');

        setTranscript(newTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);

        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          toast({
            title: "Voice Recognition Error",
            description: "There was an issue with the voice recognition service. Please try again.",
            variant: "destructive"
          });
        }
      };

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
        setError(null);
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        
        // Restart recognition automatically if continuous mode is enabled
        if (options.continuous && networkStatus !== 'offline') {
          if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = setTimeout(() => {
            console.log('Restarting speech recognition...');
            startListening();
          }, 500);
        }
      };

      recognition.start();
      setIsListening(true);
      setError(null);
      return true;
    } catch (err) {
      setError('Failed to start speech recognition');
      return false;
    }
  }, [options]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  return {
    isListening,
    transcript,
    error,
    networkStatus,
    startListening,
    stopListening
  };
}
