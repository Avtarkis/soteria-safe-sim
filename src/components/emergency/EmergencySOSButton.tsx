
import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Phone, Check, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmergencySOSButtonProps {
  className?: string;
}

const EmergencySOSButton: React.FC<EmergencySOSButtonProps> = ({ className }) => {
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const startEmergency = () => {
    setShowConfirmation(true);
  };
  
  const cancelEmergency = () => {
    setShowConfirmation(false);
    setEmergencyActive(false);
    setCountdown(5);
  };
  
  const confirmEmergency = () => {
    setShowConfirmation(false);
    setEmergencyActive(true);
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  return (
    <Card className={cn(
      "border-2 transition-all duration-300",
      emergencyActive ? "border-threat-high" : "border-border",
      className
    )}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-threat-high" />
          <span>SOS Emergency Alert</span>
        </CardTitle>
        <CardDescription>
          Activate to send alerts to your emergency contacts with your current location
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!emergencyActive && !showConfirmation ? (
          <div className="flex flex-col items-center py-8">
            <button 
              onClick={startEmergency}
              className={cn(
                "w-32 h-32 rounded-full flex items-center justify-center text-white font-bold relative",
                "bg-threat-high hover:bg-threat-high/90 transition-all duration-300",
                "focus:outline-none focus:ring-4 focus:ring-threat-high/50"
              )}
            >
              <div className="absolute w-full h-full rounded-full bg-threat-high/20 animate-ping"></div>
              <div className="text-xl">SOS</div>
            </button>
            <p className="mt-4 text-sm text-muted-foreground">
              Press the SOS button to send an emergency alert
            </p>
          </div>
        ) : showConfirmation ? (
          <div className="flex flex-col items-center py-6 animate-fade-in">
            <div className="text-center mb-6">
              <AlertTriangle className="h-16 w-16 text-threat-high mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Confirm Emergency Alert</h3>
              <p className="text-sm text-muted-foreground">
                This will notify your emergency contacts with your location
              </p>
            </div>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={cancelEmergency}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
              <Button 
                onClick={confirmEmergency}
                className="gap-1 bg-threat-high hover:bg-threat-high/90"
              >
                <Check className="h-4 w-4" />
                <span>Confirm Emergency</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="bg-threat-high/10 text-threat-high p-4 rounded-lg mb-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Emergency Alert Active</h4>
                <p className="text-sm">
                  {countdown > 0 
                    ? `Sending alerts to contacts in ${countdown} seconds...` 
                    : 'Emergency contacts have been notified with your location.'}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary/40 rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">Sharing your live location</span>
                </div>
                <span className="animate-pulse text-xs bg-threat-high/20 text-threat-high px-2 py-0.5 rounded-full">
                  Live
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-secondary/40 rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">Emergency services notified</span>
                </div>
                <Check className="h-4 w-4 text-green-500" />
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Button 
                onClick={cancelEmergency}
                variant="outline" 
                className="w-full gap-2"
              >
                <X className="h-4 w-4" />
                <span>Cancel Emergency</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmergencySOSButton;
