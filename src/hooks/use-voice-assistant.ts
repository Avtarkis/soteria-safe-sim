
import { useState, useCallback } from 'react';
import { useSpeechRecognition } from './use-speech-recognition';
import { enhancedDeepgramService } from '@/services/enhancedDeepgramService';
import { openaiService } from '@/services/openaiService';
import { toast } from '@/hooks/use-toast';
import { processVoiceCommand, generateCommandResponse } from '@/utils/voice-command-processor';

interface UseVoiceAssistantOptions {
  onCommand?: (command: string) => void;
  onResponse?: (response: string) => void;
}

export function useVoiceAssistant(options: UseVoiceAssistantOptions = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);

  const handleTranscript = useCallback(async (transcript: string) => {
    if (!transcript.toLowerCase().includes('soteria')) {
      return;
    }

    setIsProcessing(true);
    try {
      // First, check if it's a command
      const command = await processVoiceCommand(transcript);
      
      if (command && command.type !== 'unknown' && command.type !== 'conversation') {
        const response = await generateCommandResponse(command);
        setLastResponse(response);
        if (options.onResponse) {
          options.onResponse(response);
        }
        
        // Handle command execution
        if (options.onCommand) {
          options.onCommand(command.type);
        }
      } else {
        // Handle as conversation
        const messages = [
          {
            role: 'system' as const,
            content: 'You are Soteria, an AI safety assistant. You help users with travel advice, cybersecurity, emergency situations, and finding safe routes. Be concise and helpful.'
          },
          ...conversationHistory,
          { role: 'user' as const, content: transcript }
        ];

        const response = await openaiService.generateResponse(messages);
        setLastResponse(response);
        
        if (options.onResponse) {
          options.onResponse(response);
        }

        // Update conversation history
        setConversationHistory(prev => [...prev, 
          { role: 'user', content: transcript },
          { role: 'assistant', content: response }
        ]);
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [options, conversationHistory]);

  const { isListening, startListening, stopListening, transcript, error } = useSpeechRecognition({
    continuous: true,
    language: 'en-US'
  }, handleTranscript);

  return {
    isListening,
    isProcessing,
    startListening,
    stopListening,
    transcript,
    lastResponse,
    error,
    conversationHistory
  };
}
