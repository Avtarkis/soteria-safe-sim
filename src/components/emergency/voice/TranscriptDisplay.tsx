
import React from 'react';

interface TranscriptDisplayProps {
  transcript: string;
  isActive: boolean;
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  transcript,
  isActive
}) => {
  if (!transcript || !isActive) return null;

  return (
    <div className="mt-4 p-3 bg-secondary/50 rounded-md w-full">
      <p className="text-xs font-medium text-muted-foreground mb-1">
        Transcript:
      </p>
      <p className="text-sm">{transcript}</p>
    </div>
  );
};

export default TranscriptDisplay;
