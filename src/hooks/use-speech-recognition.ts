
import { useState, useEffect, useRef, useCallback } from 'react';
import { deepgramService } from '@/services/deepgramService';
import { toast } from '@/hooks/use-toast';
import { useWebAudioRecorder } from './use-web-audio-recorder';
import { NetworkStatusMonitor } from '@/utils/voice/networkStatusMonitor';
import { HybridCommandProcessor } from '@/utils/voice/hybridCommandProcessor';
import { FallbackProcessor } from '@/utils/voice/fallbackProcessor';

export interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => Promise<void>;
  stopListening: () => void;
  resetTranscript: () => void;
  hasRecognitionSupport: boolean;
  error: string | null;
}

export function useSpeechRecognition(
  options: SpeechRecognitionOptions = {},
  onTranscriptUpdate?: (transcript: string) => void
): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'poor'>('online');
  
  const { 
    startRecording, 
    stopRecording, 
    isRecording, 
    audioBlob, 
    getAudioAsBase64 
  } = useWebAudioRecorder();
  
  const hasRecognitionSupport = 'MediaRecorder' in window;
  const processingIntervalRef = useRef<number | null>(null);
  const networkMonitorUnsubscribeRef = useRef<(() => void) | null>(null);

  // Subscribe to network status changes
  useEffect(() => {
    networkMonitorUnsubscribeRef.current = NetworkStatusMonitor.subscribe((status) => {
      setNetworkStatus(status);
      console.log('Network status updated:', status);
    });
    
    return () => {
      if (networkMonitorUnsubscribeRef.current) {
        networkMonitorUnsubscribeRef.current();
      }
    };
  }, []);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopListening();
      if (processingIntervalRef.current) {
        window.clearInterval(processingIntervalRef.current);
      }
    };
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  // Process audio using appropriate service based on network status
  const processAudioChunks = useCallback(async () => {
    if (!audioBlob) return;
    
    try {
      let result = '';
      
      // Use hybrid processor to determine processing method
      if (networkStatus === 'online') {
        // Use advanced processing
        try {
          // Attempt to use Deepgram for transcription
          result = await deepgramService.transcribeAudio(audioBlob, {
            language: options.language || 'en',
            punctuate: true,
            smartFormat: true
          });
        } catch (err) {
          console.error('Error with advanced processing, falling back to local:', err);
          // Fall back to local processing
          const processedCommand = FallbackProcessor.processText(transcript);
          result = processedCommand.normalizedText;
        }
      } else {
        // Use local processing for offline or poor connection
        console.log('Using local processing due to network status:', networkStatus);
        const processedCommand = FallbackProcessor.processText(transcript);
        result = processedCommand.normalizedText;
      }
      
      setTranscript(prev => {
        const newTranscript = `${prev} ${result}`.trim();
        
        // Call the callback if provided
        if (onTranscriptUpdate) {
          onTranscriptUpdate(newTranscript);
        }
        
        return newTranscript;
      });
    } catch (err) {
      console.error('Error processing audio:', err);
      setError('Failed to process audio. Please try again.');
    }
  }, [audioBlob, options.language, onTranscriptUpdate, transcript, networkStatus]);

  // Effect to process audio when the blob changes
  useEffect(() => {
    if (audioBlob) {
      processAudioChunks();
    }
  }, [audioBlob, processAudioChunks]);

  const startListening = useCallback(async () => {
    resetTranscript();
    setError(null);

    if (!hasRecognitionSupport) {
      setError('Speech recognition is not supported in this browser.');
      toast({
        title: "Feature Not Supported",
        description: "Voice recognition is not supported in this browser."
      });
      return;
    }

    try {
      const started = await startRecording();
      
      if (started) {
        setIsListening(true);
        
        // Show network status toast if not online
        if (networkStatus !== 'online') {
          toast({
            title: networkStatus === 'offline' ? "Offline Mode" : "Poor Connection",
            description: networkStatus === 'offline'
              ? "Using offline voice recognition. Limited features available."
              : "Connection quality is poor. Some voice features may be limited.",
            variant: "default"
          });
        }
        
        // For continuous recognition, process chunks at intervals
        if (options.continuous) {
          processingIntervalRef.current = window.setInterval(() => {
            stopRecording();
            startRecording();
          }, 3000); // Process audio every 3 seconds
        }
      }
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone. Please check permissions.');
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use voice features.",
        variant: "destructive"
      });
    }
  }, [options.continuous, resetTranscript, hasRecognitionSupport, startRecording, stopRecording, networkStatus]);

  const stopListening = useCallback(() => {
    if (processingIntervalRef.current) {
      window.clearInterval(processingIntervalRef.current);
      processingIntervalRef.current = null;
    }
    
    stopRecording();
    setIsListening(false);
  }, [stopRecording]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    hasRecognitionSupport,
    error
  };
}
