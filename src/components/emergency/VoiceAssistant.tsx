
import React, { useState, useEffect, useCallback } from 'react';
import { Mic, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/CardWrapper';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import { processVoiceCommand, generateCommandResponse, ProcessedCommand } from '@/utils/voice-command-processor';

interface VoiceAssistantProps {
  className?: string;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ className }) => {
  // Voice recognition and synthesis hooks
  const { isListening, transcript, startListening, stopListening, hasRecognitionSupport } = 
    useSpeechRecognition({ continuous: true, language: 'en-US' });
  const { speak, isSpeaking } = useTextToSpeech();
  
  // Component state
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeCommand, setActiveCommand] = useState<ProcessedCommand | null>(null);
  const [lastTranscript, setLastTranscript] = useState('');
  
  // Handle command processing
  useEffect(() => {
    const processCommand = async () => {
      // Only process if we have new transcript content
      if (transcript && transcript !== lastTranscript) {
        setLastTranscript(transcript);
        setIsProcessing(true);
        
        try {
          const command = await processVoiceCommand(transcript);
          
          if (command && command.type !== 'unknown' && command.confidence > 0.6) {
            setActiveCommand(command);
            
            // Generate and speak response
            const response = await generateCommandResponse(command);
            await speak(response);
            
            // Execute the command (in a real app, this would trigger actions)
            executeCommand(command);
          }
        } catch (error) {
          console.error('Error processing command:', error);
        } finally {
          setIsProcessing(false);
        }
      }
    };
    
    processCommand();
  }, [transcript, lastTranscript, speak]);
  
  // Execute the detected command
  const executeCommand = useCallback((command: ProcessedCommand) => {
    // In a real implementation, this would trigger actual emergency features
    // For now, we'll just show toasts
    
    switch (command.type) {
      case 'emergency_call':
        toast({
          title: "Emergency Call",
          description: "Initiating emergency call to local services.",
        });
        break;
        
      case 'location_share':
        toast({
          title: "Location Shared",
          description: "Your location has been shared with emergency contacts.",
        });
        break;
        
      case 'start_recording':
        toast({
          title: "Recording Started",
          description: "Evidence recording has been initiated.",
        });
        break;
        
      case 'silent_alarm':
        toast({
          title: "Silent Alarm",
          description: "Silent alarm activated. Help is on the way.",
        });
        break;
    }
    
    // Reset active command after execution with a delay
    setTimeout(() => {
      setActiveCommand(null);
    }, 5000);
  }, []);
  
  // Toggle voice assistant listening state
  const toggleListening = useCallback(async () => {
    if (isListening) {
      stopListening();
      
      // Show toast if no command was detected after stopping
      if (!activeCommand) {
        toast({
          title: "Voice Assistant Stopped",
          description: "Voice recognition deactivated."
        });
      }
    } else {
      try {
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
      } catch (error) {
        console.error('Failed to start listening:', error);
      }
    }
  }, [isListening, startListening, stopListening, activeCommand]);

  // Determine button state (listening, processing, speaking, idle)
  const getButtonState = () => {
    if (isListening) return 'listening';
    if (isProcessing) return 'processing';
    if (isSpeaking) return 'speaking';
    return 'idle';
  };
  
  // Helper to get button status text
  const getButtonStatusText = () => {
    switch (getButtonState()) {
      case 'listening': return "Listening... Try saying:\n\"Soteria, I need help\"";
      case 'processing': return "Processing your request...";
      case 'speaking': return "Responding to your command...";
      default: return "Tap to activate voice assistant";
    }
  };
  
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
        <div className="flex flex-col items-center py-4">
          <button
            onClick={toggleListening}
            disabled={!hasRecognitionSupport || isProcessing || isSpeaking}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
              "focus:outline-none focus:ring-4 focus:ring-primary/30",
              getButtonState() === 'listening' 
                ? "bg-primary text-white shadow-lg animate-pulse" 
                : getButtonState() === 'processing' || getButtonState() === 'speaking'
                  ? "bg-amber-500 text-white shadow-lg"
                  : "bg-secondary text-primary hover:bg-secondary/80"
            )}
          >
            {getButtonState() === 'listening' || getButtonState() === 'processing' ? (
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                </div>
                <Mic className="h-6 w-6 opacity-0" />
              </div>
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </button>
          <p className="mt-4 text-sm text-center text-muted-foreground">
            {getButtonStatusText()}
          </p>
          
          {transcript && getButtonState() !== 'idle' && (
            <div className="mt-4 p-3 bg-secondary/50 rounded-md w-full">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Transcript:
              </p>
              <p className="text-sm">{transcript}</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 space-y-2 text-xs text-muted-foreground">
          <p className="font-medium">Voice Commands:</p>
          <ul className="space-y-1">
            <li className="flex items-center gap-1.5">
              <span className={cn(
                "w-1 h-1 rounded-full", 
                activeCommand?.type === 'emergency_call' ? "bg-primary" : "bg-muted-foreground"
              )}></span>
              "Soteria, call emergency services"
            </li>
            <li className="flex items-center gap-1.5">
              <span className={cn(
                "w-1 h-1 rounded-full", 
                activeCommand?.type === 'location_share' ? "bg-primary" : "bg-muted-foreground"
              )}></span>
              "Soteria, send my location to contacts"
            </li>
            <li className="flex items-center gap-1.5">
              <span className={cn(
                "w-1 h-1 rounded-full", 
                activeCommand?.type === 'start_recording' ? "bg-primary" : "bg-muted-foreground"
              )}></span>
              "Soteria, start recording evidence"
            </li>
            <li className="flex items-center gap-1.5">
              <span className={cn(
                "w-1 h-1 rounded-full", 
                activeCommand?.type === 'silent_alarm' ? "bg-primary" : "bg-muted-foreground"
              )}></span>
              "Soteria, activate silent alarm"
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceAssistant;
