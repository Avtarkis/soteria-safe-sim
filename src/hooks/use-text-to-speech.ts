
import { useState, useCallback } from 'react';
import { deepgramService } from '@/services/deepgramService';

interface TextToSpeechOptions {
  voice?: string;
  speed?: number;
  pitch?: number;
}

interface UseTextToSpeechReturn {
  speak: (text: string, options?: TextToSpeechOptions) => Promise<void>;
  isSpeaking: boolean;
  stop: () => void;
  error: string | null;
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const speak = useCallback(async (text: string, options: TextToSpeechOptions = {}) => {
    if (isSpeaking) {
      stop(); // Stop current speech before starting new one
    }
    
    try {
      setIsSpeaking(true);
      setError(null);
      
      await deepgramService.synthesizeSpeech(text, {
        voice: options.voice || 'default',
        speed: options.speed || 1.0,
        pitch: options.pitch || 1.0
      });
      
      setIsSpeaking(false);
    } catch (err) {
      console.error('Error during speech synthesis:', err);
      setError('Failed to generate speech.');
      setIsSpeaking(false);
    }
  }, [isSpeaking]);
  
  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);
  
  return {
    speak,
    isSpeaking,
    stop,
    error
  };
}
