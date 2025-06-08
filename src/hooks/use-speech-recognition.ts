
import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from './use-toast';
import { connectivityService } from '@/utils/voice/connectivity';
import type { NetworkStatus } from '@/utils/voice/connectivity';

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

  const hasRecognitionSupport = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  useEffect(() => {
    const handleNetworkChange = (status: NetworkStatus) => {
      if (status.quality === 'poor') {
        setNetworkStatus('poor');
      } else {
        setNetworkStatus(status.isOnline ? 'online' : 'offline');
      }
    };

    const checkStatus = () => {
      const status = connectivityService.getCurrentStatus();
      handleNetworkChange(status);
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  const startListening = useCallback(() => {
    if (!hasRecognitionSupport) {
      setError('Speech recognition not supported');
      return false;
    }

    try {
      const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionConstructor();
      recognitionRef.current = recognition;

      recognition.lang = options.lang || 'en-US';
      recognition.continuous = options.continuous !== false;
      recognition.interimResults = options.interimResults !== false;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const newTranscript = Array.from(event.results)
          .map((result) => result[0])
          .map((speechRecognitionResult) => speechRecognitionResult.transcript)
          .join('');

        setTranscript(newTranscript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
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
  }, [options, networkStatus, hasRecognitionSupport]);

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
    stopListening,
    hasRecognitionSupport
  };
}
