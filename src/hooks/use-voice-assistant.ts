
import { useState, useCallback, useEffect } from 'react';
import { useSpeechRecognition } from './voice/useSpeechRecognition';
import { useTextToSpeech } from './use-text-to-speech';
import { processVoiceCommand, generateCommandResponse } from '@/utils/voice-command-processor';
import { ProcessedCommand } from '@/utils/voice/types';
import { toast } from './use-toast';
import SafetyAIMonitoringService from '@/services/SafetyAIMonitoringService';

interface UseVoiceAssistantOptions {
  onCommand?: (command: ProcessedCommand) => void;
  onResponse?: (response: string) => void;
  onProcessingStateChange?: (isProcessing: boolean) => void;
  fallbackMode?: 'aggressive' | 'normal' | 'minimal';
}

export function useVoiceAssistant(options: UseVoiceAssistantOptions = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<string>('');
  const [activeCommand, setActiveCommand] = useState<ProcessedCommand | null>(null);
  const [lastTranscript, setLastTranscript] = useState('');
  const [errorCount, setErrorCount] = useState(0);
  
  const { speak, isSpeaking } = useTextToSpeech();
  const { isListening, transcript, startListening, stopListening, error } = useSpeechRecognition();
  
  // Get safety AI monitoring instance
  const safetyAI = SafetyAIMonitoringService;

  // Reset error count when starting listening
  useEffect(() => {
    if (isListening) {
      setErrorCount(0);
    }
  }, [isListening]);

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
        // Forward to safety AI for emergency detection
        safetyAI.handleVoiceCommand(transcript);
        
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
          setErrorCount(0); // Reset error count on successful command
        } else if (command && command.type === 'unknown') {
          // Handle unknown command
          toast({
            title: "Command Not Recognized",
            description: "I'm not sure what you're asking. Try saying 'Soteria, help' for assistance.",
            variant: "default"
          });
          
          // Increase error count for unknown commands
          setErrorCount(prev => prev + 1);
          
          // If multiple errors in a row, provide more guidance
          if (errorCount >= 2) {
            await speak("I'm having trouble understanding you. Try speaking clearly and saying 'Soteria' before your command.");
          }
        }
      } catch (err) {
        console.error('Error processing transcript:', err);
        setErrorCount(prev => prev + 1);
        
        toast({
          title: "Command Processing Error",
          description: "Failed to process your voice command. Please try again.",
          variant: "destructive"
        });
        
        // Provide guidance after multiple errors
        if (errorCount >= 2) {
          await speak("I'm having technical difficulties. Please try again or check your microphone.");
        }
      } finally {
        setIsProcessing(false);
        if (options.onProcessingStateChange) {
          options.onProcessingStateChange(false);
        }
      }
    };
    
    processTranscript();
  }, [transcript, lastTranscript, options, speak, errorCount, safetyAI]);

  return {
    isListening,
    isProcessing,
    startListening,
    stopListening,
    transcript,
    lastResponse,
    activeCommand,
    error,
    isSpeaking,
    errorCount
  };
}

export default useVoiceAssistant;
