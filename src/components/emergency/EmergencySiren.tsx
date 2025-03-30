
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmergencySirenProps {
  isActive: boolean;
  onToggle: () => void;
}

const EmergencySiren: React.FC<EmergencySirenProps> = ({ isActive, onToggle }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState<number>(0.8);
  const [audioLoaded, setAudioLoaded] = useState(false);

  useEffect(() => {
    // Create audio element
    const audio = new Audio('/lovable-uploads/police-siren.mp3');
    audio.loop = true;
    audio.volume = volume;
    audio.preload = 'auto';
    
    audio.addEventListener('canplaythrough', () => {
      setAudioLoaded(true);
    });
    
    audioRef.current = audio;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isActive) {
      audioRef.current.play().catch(err => {
        console.error('Error playing siren:', err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isActive]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  return (
    <div className={cn(
      "p-4 rounded-lg transition-all duration-300",
      isActive ? "bg-threat-high/20" : "bg-secondary/40" 
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isActive ? (
            <Volume2 className="h-5 w-5 text-threat-high animate-pulse" />
          ) : (
            <VolumeX className="h-5 w-5 text-muted-foreground" />
          )}
          <h3 className="font-medium">Police Siren</h3>
        </div>
        <Button 
          variant={isActive ? "destructive" : "outline"}
          size="sm" 
          onClick={onToggle}
          disabled={!audioLoaded}
          className="gap-1"
        >
          {isActive ? (
            <>
              <Pause className="h-3.5 w-3.5" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              <span>Activate</span>
            </>
          )}
        </Button>
      </div>
      
      <div className="flex items-center gap-3">
        <VolumeX className="h-4 w-4 text-muted-foreground" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
        <Volume2 className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <p className="mt-2 text-xs text-muted-foreground">
        {isActive 
          ? "Police siren is active. The loud noise may deter potential attackers." 
          : "Activate police siren to mimic approaching police vehicles."}
      </p>
    </div>
  );
};

export default EmergencySiren;
