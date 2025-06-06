
import { useState, useCallback } from 'react';
import { emergencyRecordingService, RecordingOptions } from '@/services/EmergencyRecordingService';
import { useToast } from '@/hooks/use-toast';

export function useEmergencyRecording() {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);

  const startEmergencyRecording = useCallback(async (options: RecordingOptions) => {
    try {
      const recordingId = await emergencyRecordingService.startRecording({
        ...options,
        stealth: true
      });
      
      if (recordingId) {
        setIsRecording(true);
        toast({
          title: "Recording Started",
          description: `Emergency ${options.type} recording activated.`,
        });
      }
      
      return recordingId;
    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: "Recording Error",
        description: "Unable to start emergency recording.",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  const stopRecording = useCallback((recordingId: string) => {
    const success = emergencyRecordingService.stopRecording(recordingId);
    if (success) {
      setIsRecording(false);
      toast({
        title: "Recording Stopped",
        description: "Emergency recording saved securely.",
      });
    }
    return success;
  }, [toast]);

  return {
    isRecording,
    startEmergencyRecording,
    stopRecording,
    getRecordings: emergencyRecordingService.getRecordings.bind(emergencyRecordingService)
  };
}
