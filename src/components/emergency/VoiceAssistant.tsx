
import React, { useState } from 'react';
import { Mic, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/CardWrapper';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VoiceAssistantProps {
  className?: string;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ className }) => {
  const [listening, setListening] = useState(false);
  
  const toggleListening = () => {
    setListening(!listening);
    if (!listening) {
      toast({
        title: "Voice Assistant Active",
        description: "Listening for commands..."
      });
      setTimeout(() => {
        setListening(false);
      }, 5000);
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
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
              "focus:outline-none focus:ring-4 focus:ring-primary/30",
              listening 
                ? "bg-primary text-white shadow-lg animate-pulse" 
                : "bg-secondary text-primary hover:bg-secondary/80"
            )}
          >
            {listening ? (
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
            {listening 
              ? "Listening... Try saying:\n\"Soteria, I need help\"" 
              : "Tap to activate voice assistant"}
          </p>
        </div>
        
        <div className="mt-4 space-y-2 text-xs text-muted-foreground">
          <p className="font-medium">Voice Commands:</p>
          <ul className="space-y-1">
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
              "Soteria, call emergency services"
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
              "Soteria, send my location to contacts"
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
              "Soteria, activate silent alarm"
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceAssistant;
