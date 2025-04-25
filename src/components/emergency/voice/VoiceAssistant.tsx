
import React, { useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/CardWrapper';
import { Mic } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import { toast } from '@/hooks/use-toast';
import { useVoiceCommands } from '@/hooks/use-voice-commands';
import VoiceButton from './VoiceButton';
import TranscriptDisplay from './TranscriptDisplay';
import CommandsList from './CommandsList';

interface VoiceAssistantProps {
  className?: string;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ className }) => {
  const [lastTranscript, setLastTranscript] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  const { activeCommand, executeCommand } = useVoiceCommands();
  const { isListening, transcript, startListening, stopListening, hasRecognitionSupport } = 
    useSpeechRecognition({ continuous: true, language: 'en-US' });
  const { speak, isSpeaking } = useTextToSpeech();

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
