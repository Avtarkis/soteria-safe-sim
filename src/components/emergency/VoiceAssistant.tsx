
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { cn } from '@/lib/utils';
import { useVoiceAssistant } from '@/hooks/use-voice-assistant';
import { useSecureDefense } from '@/services/SecureDefenseSystem';

const VoiceAssistant: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const { triggerEmergency } = useSecureDefense();
  
  const {
    isListening,
    isProcessing,
    startListening,
    stopListening,
    transcript,
    lastResponse,
    error,
    isSpeaking,
    errorCount
  } = useVoiceAssistant({
    onCommand: (command) => {
      console.log('Voice command processed:', command);
      
      // Check for emergency keywords and trigger emergency response
      if (command.urgency === 'critical' || command.urgency === 'high') {
        triggerEmergency({
          type: 'security',
          subtype: 'voice',
          description: `Voice command: "${command.originalText}"`,
          confidence: command.confidence,
          severity: command.urgency === 'critical' ? 'critical' : 'high',
        });
      }
    },
    onResponse: (response) => {
      console.log('Voice assistant response:', response);
    }
  });

  const handleToggleListening = () => {
    if (!isEnabled) {
      setIsEnabled(true);
      startListening();
    } else if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleDisable = () => {
    setIsEnabled(false);
    stopListening();
  };

  return (
    <Card className={cn(
      "transition-all duration-300",
      isListening ? "border-threat-high bg-threat-high/5" : "border-border"
    )}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          <span>Voice Assistant</span>
          {isSpeaking && <Volume2 className="h-4 w-4 text-blue-500 animate-pulse" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!isEnabled ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Activate voice commands to trigger emergency actions hands-free
              </p>
              <Button onClick={() => setIsEnabled(true)} className="gap-2">
                <Mic className="h-4 w-4" />
                Enable Voice Assistant
              </Button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    variant={isListening ? "destructive" : "default"}
                    size="sm"
                    onClick={handleToggleListening}
                    disabled={isProcessing}
                    className="gap-1"
                  >
                    {isListening ? (
                      <>
                        <MicOff className="h-3.5 w-3.5" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Mic className="h-3.5 w-3.5" />
                        Listen
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisable}
                    className="gap-1"
                  >
                    <VolumeX className="h-3.5 w-3.5" />
                    Disable
                  </Button>
                </div>
                
                {isProcessing && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    Processing...
                  </div>
                )}
              </div>

              {transcript && (
                <div className="p-3 bg-secondary/30 rounded-md">
                  <p className="text-sm font-medium mb-1">You said:</p>
                  <p className="text-sm text-muted-foreground">"{transcript}"</p>
                </div>
              )}

              {lastResponse && (
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-sm font-medium mb-1">Assistant:</p>
                  <p className="text-sm text-blue-700">{lastResponse}</p>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 rounded-md">
                  <p className="text-sm text-red-700">Error: {error}</p>
                  {errorCount >= 2 && (
                    <p className="text-xs text-red-600 mt-1">
                      Try speaking more clearly or check your microphone
                    </p>
                  )}
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                <p className="mb-1">
                  <strong>Emergency phrases:</strong> "Soteria help", "Soteria danger", "Soteria call police"
                </p>
                <p>Say "Soteria" before your command for best recognition.</p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceAssistant;
