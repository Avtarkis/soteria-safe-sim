
import { useState, useCallback, useEffect } from 'react';
import { useAudioRecording } from './useAudioRecording';
import { processCommand } from '@/utils/voice/commands/commandProcessor';
import { ProcessedCommand } from '@/utils/voice/types';
import { toast } from '@/hooks/use-toast';

interface UseSpeechRecognitionOptions {
  continuous?: boolean;
  language?: string;
  onTranscript?: (transcript: ProcessedCommand) => void;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { isRecording, startRecording, stopRecording, audioBlob } = useAudioRecording();

  const handleTranscript = useCallback(async (text: string) => {
    if (!text) return;
    
    setTranscript(text);
    
    const command = await processCommand(text);
    if (command && options.onTranscript) {
      options.onTranscript(command);
    }
  }, [options]);

  useEffect(() => {
    if (audioBlob) {
      // Process audio blob to text using deepgram or fallback
      handleTranscript(transcript);
    }
  }, [audioBlob, handleTranscript, transcript]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening: isRecording,
    transcript,
    startListening: startRecording,
    stopListening: stopRecording,
    resetTranscript,
    error,
    hasRecognitionSupport: 'MediaRecorder' in window
  };
}
