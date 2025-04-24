
import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/CardWrapper';
import { Mic } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import { processCommand } from '@/utils/voice/commandProcessor';
import { generateResponse } from '@/utils/voice/responseGenerator';
import { ProcessedCommand, VoiceCommandType } from '@/utils/voice/types';
import VoiceButton from './VoiceButton';
import TranscriptDisplay from './TranscriptDisplay';
import CommandsList from './CommandsList';
import { toast } from '@/hooks/use-toast';

interface VoiceAssistantProps {
  className?: string;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ className }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeCommand, setActiveCommand] = useState<ProcessedCommand | null>(null);
  const [lastTranscript, setLastTranscript] = useState('');
  
  const { isListening, transcript, startListening, stopListening, hasRecognitionSupport } = 
    useSpeechRecognition({ continuous: true, language: 'en-US' });
  const { speak, isSpeaking } = useTextToSpeech();
  
  const handleVoiceCommand = useCallback(async () => {
    if (transcript && transcript !== lastTranscript) {
      setLastTranscript(transcript);
      setIsProcessing(true);
      
      try {
        const command = await processCommand(transcript);
        
        if (command && command.type !== 'unknown' && command.confidence > 0.6) {
          setActiveCommand(command);
          const response = await generateResponse(command);
          await speak(response);
          
          // Notify the user about recognized commands
          toast({
            title: `Command: ${command.type.replace('_', ' ')}`,
            description: "Command recognized and processed"
          });
        }
      } catch (error) {
        console.error('Error processing command:', error);
        toast({
          title: "Command Error",
          description: "Failed to process voice command",
          variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
    }
  }, [transcript, lastTranscript, speak]);
  
  React.useEffect(() => {
    handleVoiceCommand();
  }, [handleVoiceCommand]);
  
  const toggleListening = useCallback(async () => {
    if (isListening) {
      stopListening();
      toast({
        title: "Voice Assistant Paused",
        description: "Voice recognition turned off"
      });
    } else {
      await startListening();
      toast({
        title: "Voice Assistant Active",
        description: "Listening for commands..."
      });
      
      // Auto-stop after 10 seconds if no command detected
      setTimeout(() => {
        if (isListening) {
          stopListening();
        }
      }, 10000);
    }
  }, [isListening, startListening, stopListening]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          <span>AI Voice Assistant</span>
        </CardTitle>
        <CardDescription>
          Hands-free emergency help via voice commands
        </CardDescription>
      </CardHeader>
      <CardContent>
        <VoiceButton
          isListening={isListening}
          isProcessing={isProcessing}
          isSpeaking={isSpeaking}
          hasRecognitionSupport={hasRecognitionSupport}
          onToggle={toggleListening}
        />
        
        <TranscriptDisplay 
          transcript={transcript}
          isActive={isListening || isProcessing}
        />
        
        <CommandsList 
          activeCommand={activeCommand?.type ?? null}
        />
      </CardContent>
    </Card>
  );
};

export default VoiceAssistant;
