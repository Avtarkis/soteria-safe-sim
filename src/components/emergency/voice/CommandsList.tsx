
import React from 'react';
import { cn } from '@/lib/utils';
import { VoiceCommandType } from '@/utils/voice/types';

interface CommandsListProps {
  activeCommand: VoiceCommandType | null;
}

const CommandsList: React.FC<CommandsListProps> = ({ activeCommand }) => {
  const commands = [
    { type: 'emergency_call', text: "Soteria, call emergency services" },
    { type: 'location_share', text: "Soteria, send my location to contacts" },
    { type: 'start_recording', text: "Soteria, start recording evidence" },
    { type: 'silent_alarm', text: "Soteria, activate silent alarm" }
  ];

  return (
    <div className="mt-4 space-y-2 text-xs text-muted-foreground">
      <p className="font-medium">Voice Commands:</p>
      <ul className="space-y-1">
        {commands.map(({ type, text }) => (
          <li key={type} className="flex items-center gap-1.5">
            <span className={cn(
              "w-1 h-1 rounded-full", 
              activeCommand === type ? "bg-primary" : "bg-muted-foreground"
            )}></span>
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommandsList;
