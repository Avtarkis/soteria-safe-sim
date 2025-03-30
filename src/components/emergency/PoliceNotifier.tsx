
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Shield, Clock, MapPin, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface PoliceNotifierProps {
  hasBeenCalled: boolean;
  onCallPolice: () => void;
}

const PoliceNotifier: React.FC<PoliceNotifierProps> = ({ 
  hasBeenCalled, 
  onCallPolice 
}) => {
  const [calling, setCalling] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    
    if (hasBeenCalled && remainingTime !== null && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            
            toast({
              title: "Police Have Arrived",
              description: "Emergency services have reached your location.",
            });
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [hasBeenCalled, remainingTime]);

  const handleCallPolice = () => {
    setCalling(true);
    
    // Simulate calling police
    setTimeout(() => {
      // Generate a random ETA between 3-10 minutes
      const eta = Math.floor(Math.random() * 8) + 3;
      setEstimatedTime(eta);
      setRemainingTime(eta * 60); // Convert to seconds for countdown
      onCallPolice();
      setCalling(false);
      
      toast({
        title: "Emergency Services Notified",
        description: `Police are on their way and will arrive in approximately ${eta} minutes.`,
      });
      
      // In a real app, this would connect to emergency services
      // This could be done via:
      // 1. Direct call to emergency services using the phone's dialer
      // 2. E911 API integration where available
      // 3. Sending location and emergency details to dispatch centers
    }, 3000);
  };

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "00:00";
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn(
      "p-4 rounded-lg transition-all duration-300",
      hasBeenCalled ? "bg-threat-high/20" : "bg-secondary/40"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className={cn(
            "h-5 w-5",
            hasBeenCalled ? "text-threat-high" : "text-muted-foreground"
          )} />
          <h3 className="font-medium">Emergency Services</h3>
        </div>
      </div>
      
      {hasBeenCalled ? (
        <div className="space-y-3 mb-3">
          <div className="bg-background rounded-md p-3 border border-border shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Police Response</span>
              <div className="text-xs bg-secondary py-1 px-2 rounded-full flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>ETA: {remainingTime === 0 ? "Arrived" : formatTime(remainingTime)}</span>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Officers dispatched to your location</span>
              </div>
              
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Your evidence has been received</span>
              </div>
              
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span>Live location tracking active</span>
              </div>
            </div>
          </div>
          
          {remainingTime !== 0 && (
            <div className="text-sm text-center text-muted-foreground">
              The police have been notified of the attackers' appearance from your uploaded evidence and are on their way.
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm mb-3">
          Immediately notify emergency services of your situation. This will send your 
          location and any evidence you've collected.
        </p>
      )}
      
      <div className="flex justify-center">
        <Button
          variant={hasBeenCalled ? (remainingTime === 0 ? "outline" : "default") : "default"}
          onClick={handleCallPolice}
          disabled={calling || (hasBeenCalled && remainingTime !== 0)}
          className={cn(
            "gap-1 w-full",
            !hasBeenCalled && "bg-threat-high hover:bg-threat-high/90",
            remainingTime === 0 && "bg-green-600 hover:bg-green-700"
          )}
        >
          {calling ? (
            <>
              <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
              <span>Notifying Police...</span>
            </>
          ) : hasBeenCalled ? (
            remainingTime === 0 ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Police Have Arrived</span>
              </>
            ) : (
              <>
                <Clock className="h-4 w-4" />
                <span>Police En Route</span>
              </>
            )
          ) : (
            <>
              <Phone className="h-4 w-4" />
              <span>Call Emergency Services</span>
            </>
          )}
        </Button>
      </div>
      
      <p className="mt-2 text-xs text-muted-foreground">
        {hasBeenCalled 
          ? remainingTime === 0 
            ? "Emergency services have arrived at your location."
            : `Emergency services have been notified and will arrive in approximately ${estimatedTime} minutes.`
          : "This will immediately alert police with your location and situation."}
      </p>
    </div>
  );
};

export default PoliceNotifier;
