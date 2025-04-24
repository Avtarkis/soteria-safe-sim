
import { useState, useEffect, useRef, useCallback } from 'react';
import { deepgramService } from '@/services/deepgramService';
import { toast } from '@/hooks/use-toast';
import { useWebAudioRecorder } from './use-web-audio-recorder';

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
  
  const { 
    startRecording, 
    stopRecording, 
    isRecording, 
    audioBlob, 
    getAudioAsBase64 
  } = useWebAudioRecorder();
  
  const hasRecognitionSupport = 'MediaRecorder' in window;
  const processingIntervalRef = useRef<number | null>(null);

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

  const processAudioChunks = useCallback(async () => {
    if (!audioBlob) return;
    
    try {
      // Use Deepgram to transcribe
      const result = await deepgramService.transcribeAudio(audioBlob, {
        language: options.language || 'en',
        punctuate: true,
        smartFormat: true
      });
      
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
  }, [audioBlob, options.language, onTranscriptUpdate]);

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
        description: "Please allow microphone access to use voice features."
      });
    }
  }, [options.continuous, resetTranscript, hasRecognitionSupport, startRecording, stopRecording]);

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
