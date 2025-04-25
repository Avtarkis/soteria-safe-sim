
import { useState, useCallback, useEffect } from 'react';
import { useSpeechRecognition } from './use-speech-recognition';
import { useTextToSpeech } from './use-text-to-speech';
import { processVoiceCommand, generateCommandResponse } from '@/utils/voice-command-processor';
import { ProcessedCommand } from '@/utils/voice/types';
import { toast } from './use-toast';

interface UseVoiceAssistantOptions {
  onCommand?: (command: ProcessedCommand) => void;
  onResponse?: (response: string) => void;
  onProcessingStateChange?: (isProcessing: boolean) => void;
}

export function useVoiceAssistant(options: UseVoiceAssistantOptions = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<string>('');
  const [activeCommand, setActiveCommand] = useState<ProcessedCommand | null>(null);
  const [lastTranscript, setLastTranscript] = useState('');
  
  const { speak, isSpeaking } = useTextToSpeech();
  const { isListening, transcript, startListening, stopListening, error } = useSpeechRecognition();

  // Process transcript to detect commands
  useEffect(() => {
    const processTranscript = async () => {
      if (!transcript || transcript === lastTranscript) return;
      
      setLastTranscript(transcript);
      setIsProcessing(true);
      
      if (options.onProcessingStateChange) {
        options.onProcessingStateChange(true);
      }
      
      try {
        const command = await processVoiceCommand(transcript);
        
        if (command && command.type !== 'unknown') {
          setActiveCommand(command);
          
          if (options.onCommand) {
            options.onCommand(command);
          }
          
          // Generate and speak response
          const response = await generateCommandResponse(command);
          setLastResponse(response);
          
          if (options.onResponse) {
            options.onResponse(response);
          }
          
          await speak(response);
        }
      } catch (error) {
        console.error('Error processing transcript:', error);
        toast({
          title: "Command Processing Error",
          description: "Failed to process your voice command."
        });
      } finally {
        setIsProcessing(false);
        if (options.onProcessingStateChange) {
          options.onProcessingStateChange(false);
        }
      }
    };
    
    processTranscript();
  }, [transcript, lastTranscript, options, speak]);

  return {
    isListening,
    isProcessing,
    startListening,
    stopListening,
    transcript,
    lastResponse,
    activeCommand,
    error,
    isSpeaking
  };
}
