
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Mic, Camera, Square, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface EmergencyRecorderProps {
  mode: 'off' | 'video' | 'audio' | 'photo';
  onModeChange: (mode: 'off' | 'video' | 'audio' | 'photo') => void;
}

const EmergencyRecorder: React.FC<EmergencyRecorderProps> = ({ mode, onModeChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedData, setRecordedData] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    checkPermissions();
    return () => {
      stopRecording();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (mode !== 'off') {
      startRecording();
    } else {
      stopRecording();
    }
  }, [mode]);

  const checkPermissions = async () => {
    try {
      const constraints = {
        video: true,
        audio: true
      };
      
      const testStream = await navigator.mediaDevices.getUserMedia(constraints);
      testStream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
    } catch (error) {
      console.error('Permission denied:', error);
      setHasPermission(false);
      toast({
        title: "Permission Required",
        description: "Camera and microphone access is needed for emergency recording.",
        variant: "destructive",
      });
    }
  };

  const startRecording = async () => {
    if (!hasPermission || isRecording) return;

    try {
      let constraints: MediaStreamConstraints = {};
      
      switch (mode) {
        case 'video':
          constraints = { video: true, audio: true };
          break;
        case 'audio':
          constraints = { audio: true };
          break;
        case 'photo':
          constraints = { video: true };
          break;
        default:
          return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current && (mode === 'video' || mode === 'photo')) {
        videoRef.current.srcObject = mediaStream;
      }

      if (mode !== 'photo') {
        // Start recording for video and audio
        const mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4'
        });
        
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, {
            type: mode === 'audio' ? 'audio/webm' : 'video/webm'
          });
          setRecordedData(blob);
          
          // Auto-save to device storage
          saveRecording(blob);
        };

        mediaRecorder.start(1000); // Record in 1-second chunks
        setIsRecording(true);
        setRecordingDuration(0);

        // Start duration timer
        intervalRef.current = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
        }, 1000);

        toast({
          title: "Recording Started",
          description: `Emergency ${mode} recording is now active.`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: "Recording Failed",
        description: "Unable to start recording. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    setIsRecording(false);
    setRecordingDuration(0);
  };

  const takePhoto = async () => {
    if (!videoRef.current || !stream) return;

    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          setRecordedData(blob);
          saveRecording(blob);
          
          toast({
            title: "Photo Captured",
            description: "Emergency photo has been saved to your device.",
          });
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const saveRecording = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = mode === 'photo' ? 'jpg' : mode === 'audio' ? 'webm' : 'webm';
    a.download = `emergency-${mode}-${timestamp}.${extension}`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn(
      "p-4 rounded-lg transition-all duration-300",
      isRecording ? "bg-threat-high/20" : "bg-secondary/40"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {mode === 'video' && <Video className="h-5 w-5" />}
          {mode === 'audio' && <Mic className="h-5 w-5" />}
          {mode === 'photo' && <Camera className="h-5 w-5" />}
          {mode === 'off' && <Square className="h-5 w-5 text-muted-foreground" />}
          <h3 className="font-medium">Emergency Recorder</h3>
        </div>
        
        {isRecording && (
          <div className="flex items-center gap-2 text-threat-high">
            <div className="w-2 h-2 bg-threat-high rounded-full animate-pulse"></div>
            <span className="text-sm font-mono">{formatDuration(recordingDuration)}</span>
          </div>
        )}
      </div>

      {(mode === 'video' || mode === 'photo') && (
        <div className="mb-3">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-32 bg-black rounded object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mb-3">
        <Button
          variant={mode === 'video' ? 'destructive' : 'outline'}
          size="sm"
          onClick={() => onModeChange(mode === 'video' ? 'off' : 'video')}
          disabled={!hasPermission}
          className="gap-1"
        >
          <Video className="h-3.5 w-3.5" />
          Video
        </Button>
        
        <Button
          variant={mode === 'audio' ? 'destructive' : 'outline'}
          size="sm"
          onClick={() => onModeChange(mode === 'audio' ? 'off' : 'audio')}
          disabled={!hasPermission}
          className="gap-1"
        >
          <Mic className="h-3.5 w-3.5" />
          Audio
        </Button>
      </div>

      {mode === 'photo' && (
        <Button
          onClick={takePhoto}
          disabled={!stream}
          className="w-full gap-1"
          variant="outline"
        >
          <Camera className="h-4 w-4" />
          Take Photo
        </Button>
      )}

      {mode !== 'off' && mode !== 'photo' && (
        <Button
          onClick={() => onModeChange('off')}
          disabled={!isRecording}
          className="w-full gap-1"
          variant="destructive"
        >
          <Square className="h-4 w-4" />
          Stop Recording
        </Button>
      )}

      <p className="mt-2 text-xs text-muted-foreground">
        {hasPermission === false
          ? "Camera/microphone permission required for emergency recording."
          : isRecording
          ? "Recording in progress. Evidence is being saved automatically."
          : "Ready to record emergency evidence when needed."}
      </p>
    </div>
  );
};

export default EmergencyRecorder;
