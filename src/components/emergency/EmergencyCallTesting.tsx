
import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, AlertCircle, ShieldAlert, Heart, VolumeX } from 'lucide-react';
import { useEmergencyCall } from '@/hooks/use-emergency-call';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const EmergencyCallTesting: React.FC = () => {
  const { isCallActive, startEmergencyCall, endEmergencyCall } = useEmergencyCall();

  return (
    <Card className="border-dashed bg-muted/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          <span>Emergency Call Testing</span>
        </CardTitle>
        <CardDescription>
          Test the simulated emergency call feature with different scenarios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-auto py-3"
            onClick={() => startEmergencyCall('default')}
            disabled={isCallActive}
          >
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <div className="text-left">
              <div className="font-medium">Generic Emergency</div>
              <div className="text-xs text-muted-foreground">Standard police response</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-auto py-3"
            onClick={() => startEmergencyCall('weapon')}
            disabled={isCallActive}
          >
            <ShieldAlert className="h-4 w-4 text-red-500" />
            <div className="text-left">
              <div className="font-medium">Weapon Threat</div>
              <div className="text-xs text-muted-foreground">Armed threat response</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-auto py-3"
            onClick={() => startEmergencyCall('health')}
            disabled={isCallActive}
          >
            <Heart className="h-4 w-4 text-red-500" />
            <div className="text-left">
              <div className="font-medium">Medical Emergency</div>
              <div className="text-xs text-muted-foreground">Health crisis response</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-auto py-3"
            onClick={() => startEmergencyCall('fall')}
            disabled={isCallActive}
          >
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <div className="text-left">
              <div className="font-medium">Fall Detected</div>
              <div className="text-xs text-muted-foreground">Fall emergency response</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-auto py-3"
            onClick={() => startEmergencyCall('audio')}
            disabled={isCallActive}
          >
            <VolumeX className="h-4 w-4 text-orange-500" />
            <div className="text-left">
              <div className="font-medium">Audio Threat</div>
              <div className="text-xs text-muted-foreground">Gunshot/scream detected</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-auto py-3"
            onClick={() => startEmergencyCall('sos')}
            disabled={isCallActive}
          >
            <Phone className="h-4 w-4 text-red-500" />
            <div className="text-left">
              <div className="font-medium">SOS Alert</div>
              <div className="text-xs text-muted-foreground">Manual emergency trigger</div>
            </div>
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {isCallActive ? 'Emergency call is currently active' : 'No active emergency call'}
        </div>
        {isCallActive && (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={endEmergencyCall}
          >
            End Active Call
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default EmergencyCallTesting;
