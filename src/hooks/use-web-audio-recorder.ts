
import { useState, useRef, useCallback } from 'react';
import { toast } from './use-toast';
import { connectivityService } from '@/utils/voice/connectivity';
import { HybridCommandProcessor } from '@/utils/voice/hybridCommandProcessor';

export function useWebAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    audioChunksRef.current = [];
    setAudioBlob(null);
    
    // Check network status before starting
    const networkStatus = connectivityService.getCurrentStatus();
    if (networkStatus === 'poor') {
      toast({
        title: "Poor Connection Detected",
        description: "Using basic voice recognition mode.",
        variant: "warning"
      });
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Access Error",
        description: "Please allow microphone access to use voice features.",
        variant: "destructive"
      });
      return false;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      return true;
    }
    return false;
  }, []);

  const getAudioAsBase64 = useCallback(async (): Promise<string | null> => {
    if (!audioBlob) return null;
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.readAsDataURL(audioBlob);
    });
  }, [audioBlob]);

  return {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    getAudioAsBase64
  };
}
