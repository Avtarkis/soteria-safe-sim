
import React from 'react';
import { Mic, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceButtonProps {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  hasRecognitionSupport: boolean;
  onToggle: () => void;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({
  isListening,
  isProcessing,
  isSpeaking,
  hasRecognitionSupport,
  onToggle
}) => {
  const getButtonState = () => {
    if (isListening) return 'listening';
    if (isProcessing) return 'processing';
    if (isSpeaking) return 'speaking';
    return 'idle';
  };

  const getButtonStatusText = () => {
    switch (getButtonState()) {
      case 'listening': return "Listening... Try saying:\n\"Soteria, I need help\"";
      case 'processing': return "Processing your request...";
      case 'speaking': return "Responding to your command...";
      default: return "Tap to activate voice assistant";
    }
  };

  return (
    <div className="flex flex-col items-center py-4">
      <button
        onClick={onToggle}
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
    </div>
  );
};

export default VoiceButton;
