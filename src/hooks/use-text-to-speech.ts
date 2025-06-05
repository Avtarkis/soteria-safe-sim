
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
      
      const audioBuffer = await deepgramService.synthesizeSpeech(text, {
        voice: options.voice || 'aura-asteria-en',
        speed: options.speed || 1.0,
        pitch: options.pitch || 1.0
      });
      
      if (audioBuffer) {
        // Create audio element and play
        const audioBlob = new Blob([audioBuffer], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.onerror = () => {
          setIsSpeaking(false);
          setError('Failed to play synthesized speech');
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
      } else {
        // Fallback to browser speech synthesis
        if (window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = options.speed || 1.0;
          utterance.pitch = options.pitch || 1.0;
          
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = () => {
            setIsSpeaking(false);
            setError('Speech synthesis failed');
          };
          
          window.speechSynthesis.speak(utterance);
        } else {
          setIsSpeaking(false);
          setError('Speech synthesis not supported');
        }
      }
      
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
