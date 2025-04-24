
import { useState, useEffect, useRef, useCallback } from 'react';
import { deepgramService } from '@/services/deepgramService';
import { toast } from '@/hooks/use-toast';

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
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const hasRecognitionSupport = 'MediaRecorder' in window;

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  const processAudioChunks = useCallback(async () => {
    if (audioChunksRef.current.length === 0) return;
    
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      audioChunksRef.current = []; // Reset chunks
      
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
  }, [options.language, onTranscriptUpdate]);

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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = processAudioChunks;
      
      // Start recording
      mediaRecorder.start();
      setIsListening(true);
      
      // For continuous recognition, process chunks at intervals
      if (options.continuous) {
        const interval = setInterval(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.start();
          } else {
            clearInterval(interval);
          }
        }, 3000); // Process audio every 3 seconds
        
        return () => {
          clearInterval(interval);
          stopListening();
        };
      }
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone. Please check permissions.');
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use voice features."
      });
    }
  }, [options.continuous, processAudioChunks, resetTranscript, hasRecognitionSupport]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    // Stop all tracks in the stream to release the microphone
    if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    setIsListening(false);
  }, []);

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
