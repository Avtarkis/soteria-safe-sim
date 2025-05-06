
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldAlert, ShieldCheck, ShieldX, Activity, Volume2, Heart } from 'lucide-react';
import { useSafetyAIMonitoring, MonitoringStatus } from '@/services/SafetyAIMonitoringService';
import { toast } from '@/hooks/use-toast';

interface AIMonitoringStatusProps {
  className?: string;
}

const AIMonitoringStatus: React.FC<AIMonitoringStatusProps> = ({ className }) => {
  const { status, startMonitoring, stopMonitoring } = useSafetyAIMonitoring();
  
  const toggleMonitoring = async () => {
    if (status.active) {
      stopMonitoring();
      toast({
        title: "AI Monitoring Stopped",
        description: "Threat detection has been deactivated."
      });
    } else {
      const success = await startMonitoring({
        poseDetection: true,
        audioDetection: true,
        healthMonitoring: true
      });
      
      if (success) {
        toast({
          title: "AI Monitoring Started",
          description: "Now protecting you with threat detection & health monitoring."
        });
      } else {
        toast({
          title: "Failed to Start Monitoring",
          description: "Could not activate AI protection. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status.active ? (
              <ShieldCheck className="h-5 w-5 text-green-500" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-muted-foreground" />
            )}
            <span>AI Safety Monitoring</span>
          </div>
          
          <Badge 
            variant={status.active ? "default" : "outline"}
            className={status.active ? "bg-green-500" : ""}
          >
            {status.active ? "Active" : "Inactive"}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="mb-5 space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Activity className={`h-4 w-4 ${status.detectionModes.pose ? 'text-blue-500' : 'text-muted-foreground'}`} />
              <span>Motion Detection</span>
            </div>
            
            <Badge variant={status.detectionModes.pose ? "default" : "outline"} className="text-xs">
              {status.detectionModes.pose ? "On" : "Off"}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Volume2 className={`h-4 w-4 ${status.detectionModes.audio ? 'text-indigo-500' : 'text-muted-foreground'}`} />
              <span>Audio Monitoring</span>
            </div>
            
            <Badge variant={status.detectionModes.audio ? "default" : "outline"} className="text-xs">
              {status.detectionModes.audio ? "On" : "Off"}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Heart className={`h-4 w-4 ${status.detectionModes.health ? 'text-red-500' : 'text-muted-foreground'}`} />
              <span>Health Monitoring</span>
            </div>
            
            <Badge variant={status.detectionModes.health ? "default" : "outline"} className="text-xs">
              {status.detectionModes.health ? "On" : "Off"}
            </Badge>
          </div>
        </div>

        <Button 
          onClick={toggleMonitoring} 
          variant={status.active ? "outline" : "default"}
          className="w-full"
        >
          {status.active ? (
            <>
              <ShieldX className="mr-2 h-4 w-4" />
              Deactivate Monitoring
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Activate Protection
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AIMonitoringStatus;
