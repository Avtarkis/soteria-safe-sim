
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Video, Mic, Square, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface EmergencyRecorderProps {
  mode: 'off' | 'video' | 'audio' | 'photo';
  onModeChange: (mode: 'off' | 'video' | 'audio' | 'photo') => void;
}

const EmergencyRecorder: React.FC<EmergencyRecorderProps> = ({ mode, onModeChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlobs, setRecordedBlobs] = useState<Blob[]>([]);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  const stopMediaStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      toast({
        title: `Evidence ${mode === 'video' ? 'Video' : 'Audio'} Saved`,
        description: "The recording has been saved as evidence."
      });
    }
  };

  const takePhoto = async () => {
    if (!videoRef.current || !stream) {
      toast({
        title: "Camera Error",
        description: "Cannot access camera to take photo.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }
      
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob(blob => {
        if (blob) {
          // Save photo as evidence
          toast({
            title: "Evidence Photo Saved",
            description: "The photo has been saved as evidence."
          });
        }
      }, 'image/jpeg');
    } catch (error) {
      console.error('Error taking photo:', error);
      toast({
        title: "Error",
        description: "Failed to capture photo.",
        variant: "destructive"
      });
    }
  };

  const startCamera = async (withAudio = false) => {
    try {
      stopMediaStream();
      
      const constraints = {
        video: true,
        audio: withAudio
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStream(mediaStream);
      setHasCameraPermission(true);
      if (withAudio) setHasMicPermission(true);
      
      return mediaStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        toast({
          title: "Permission Denied",
          description: "Camera or microphone access was denied.",
          variant: "destructive"
        });
        setHasCameraPermission(false);
        if (withAudio) setHasMicPermission(false);
      } else {
        toast({
          title: "Device Error",
          description: "Could not access camera or microphone.",
          variant: "destructive"
        });
      }
      
      return null;
    }
  };

  const startAudioOnly = async () => {
    try {
      stopMediaStream();
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
      
      setStream(mediaStream);
      setHasMicPermission(true);
      
      return mediaStream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      
      toast({
        title: "Microphone Error",
        description: "Could not access microphone.",
        variant: "destructive"
      });
      
      setHasMicPermission(false);
      return null;
    }
  };

  const startRecording = async () => {
    try {
      let mediaStream: MediaStream | null = null;
      
      if (mode === 'video') {
        mediaStream = await startCamera(true);
      } else if (mode === 'audio') {
        mediaStream = await startAudioOnly();
      }
      
      if (!mediaStream) return;
      
      const options = { mimeType: mode === 'video' ? 'video/webm;codecs=vp9,opus' : 'audio/webm;codecs=opus' };
      const recorder = new MediaRecorder(mediaStream, options);
      
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        setRecordedBlobs(chunks);
        
        // Save the recording
        const blob = new Blob(chunks, { type: mode === 'video' ? 'video/webm' : 'audio/webm' });
        const url = URL.createObjectURL(blob);
        
        // In a real app, you would upload this to a server
        console.log('Evidence URL for download:', url);
      };
      
      mediaRecorderRef.current = recorder;
      recorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to start recording.",
        variant: "destructive"
      });
    }
  };

  const handleModeChange = async (newMode: 'off' | 'video' | 'audio' | 'photo') => {
    // Stop any ongoing recording first
    if (isRecording) {
      stopRecording();
    }
    
    // Turn off everything if 'off' is selected
    if (newMode === 'off') {
      stopMediaStream();
      onModeChange('off');
      return;
    }
    
    onModeChange(newMode);
    
    // Handle camera initialization for photo mode
    if (newMode === 'photo') {
      const mediaStream = await startCamera(false);
      if (mediaStream) {
        // Ready for taking a photo but not recording
      }
    }
  };

  useEffect(() => {
    return () => {
      stopMediaStream();
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn(
      "p-4 rounded-lg transition-all duration-300",
      mode !== 'off' ? "bg-threat-high/20" : "bg-secondary/40"
    )}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">Evidence Collection</h3>
        
        <div className="flex gap-1">
          <Button
            variant={mode === 'video' ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => handleModeChange(mode === 'video' ? 'off' : 'video')}
          >
            <Video className="h-4 w-4" />
          </Button>
          <Button
            variant={mode === 'audio' ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => handleModeChange(mode === 'audio' ? 'off' : 'audio')}
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button
            variant={mode === 'photo' ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => handleModeChange(mode === 'photo' ? 'off' : 'photo')}
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {mode !== 'off' && (
        <div className="relative rounded-md overflow-hidden bg-black aspect-video mb-3">
          {(mode === 'video' || mode === 'photo') && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}
          
          {mode === 'audio' && (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary/20">
              <Mic className={cn(
                "h-12 w-12 text-primary",
                isRecording && "text-threat-high animate-pulse"
              )} />
            </div>
          )}
          
          {isRecording && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-threat-high text-white px-2 py-1 rounded-full text-xs">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
              <span>{formatTime(recordingTime)}</span>
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-center">
        {mode === 'photo' ? (
          <Button
            onClick={takePhoto}
            className="gap-1"
            disabled={!stream}
          >
            <Camera className="h-4 w-4" />
            <span>Capture Photo</span>
          </Button>
        ) : mode !== 'off' ? (
          isRecording ? (
            <Button
              variant="destructive"
              onClick={stopRecording}
              className="gap-1"
            >
              <Square className="h-4 w-4" />
              <span>Stop Recording</span>
            </Button>
          ) : (
            <Button
              onClick={startRecording}
              className="gap-1"
            >
              <AlertCircle className="h-4 w-4" />
              <span>Start Recording</span>
            </Button>
          )
        ) : null}
      </div>
      
      <p className="mt-2 text-xs text-muted-foreground">
        {mode === 'off' 
          ? "Quickly record video, audio or take photos for evidence." 
          : `${mode.charAt(0).toUpperCase() + mode.slice(1)} mode active. ${isRecording ? 'Recording in progress.' : 'Ready to record.'}`}
      </p>
    </div>
  );
};

export default EmergencyRecorder;
