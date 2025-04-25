
import { useState, useCallback } from 'react';
import { ProcessedCommand } from '@/utils/voice/types';
import { processVoiceCommand, generateCommandResponse } from '@/utils/voice-command-processor';
import { toast } from '@/hooks/use-toast';

export function useVoiceCommands() {
  const [activeCommand, setActiveCommand] = useState<ProcessedCommand | null>(null);

  const executeCommand = useCallback((command: ProcessedCommand) => {
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
    
    setTimeout(() => setActiveCommand(null), 5000);
  }, []);

  return { activeCommand, setActiveCommand, executeCommand };
}
