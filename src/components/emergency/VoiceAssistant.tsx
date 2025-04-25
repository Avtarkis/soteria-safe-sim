
import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/CardWrapper';
import { Mic } from 'lucide-react';
import { useVoiceAssistant } from '@/hooks/use-voice-assistant';
import VoiceButton from './voice/VoiceButton';
import TranscriptDisplay from './voice/TranscriptDisplay';
import CommandsList from './voice/CommandsList';

interface VoiceAssistantProps {
  className?: string;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ className }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { 
    isListening, 
    startListening, 
    stopListening, 
    transcript, 
    lastResponse,
    error,
    activeCommand
  } = useVoiceAssistant({
    onProcessingStateChange: (state) => setIsProcessing(state)
  });
  
  const toggleListening = useCallback(async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
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
          isSpeaking={false}
          hasRecognitionSupport={'MediaRecorder' in window}
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
