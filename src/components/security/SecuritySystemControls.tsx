
import React, { useState } from 'react';
import { useSecureDefense } from '@/services/SecureDefenseSystem';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Shield, ShieldAlert, ShieldOff, FileVideo, Send, MoveUpRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const SecuritySystemControls = () => {
  const { 
    status, 
    activateSecurity, 
    deactivateSecurity,
    triggerEmergency
  } = useSecureDefense();
  
  const [loading, setLoading] = useState(false);
  
  const handleToggleSecurity = async () => {
    setLoading(true);
    
    if (status.isActive) {
      deactivateSecurity();
    } else {
      await activateSecurity();
    }
    
    setLoading(false);
  };
  
  const handleTestEmergency = () => {
    triggerEmergency();
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className={cn(
        "border-2 transition-all duration-300",
        status.isActive && status.emergencyMode 
          ? "border-red-500 bg-red-50" 
          : status.isActive 
            ? "border-green-500 bg-green-50/50"
            : "border-muted"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              {status.emergencyMode ? (
                <ShieldAlert className="h-5 w-5 text-red-500" />
              ) : status.isActive ? (
                <Shield className="h-5 w-5 text-green-500" />
              ) : (
                <ShieldOff className="h-5 w-5 text-muted-foreground" />
              )}
              <span>Security System</span>
            </CardTitle>
            
            <Badge variant={status.emergencyMode ? "destructive" : status.isActive ? "default" : "outline"}>
              {status.emergencyMode ? "EMERGENCY" : status.isActive ? "ACTIVE" : "INACTIVE"}
            </Badge>
          </div>
          <CardDescription>
            Advanced protection with automatic threat detection
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {status.emergencyMode && (
              <Alert variant="destructive" className="animate-pulse">
                <AlertTitle className="font-bold">Emergency Mode Active</AlertTitle>
                <AlertDescription>
                  {status.stealthMode 
                    ? "The system is recording evidence and contacting emergency services. Stay calm."
                    : "Emergency services are being notified. Stay safe."}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium">Security System</div>
                <div className="text-sm text-muted-foreground">
                  {status.isActive 
                    ? "Protection active with AI monitoring" 
                    : "System is currently disabled"}
                </div>
              </div>
              <Switch 
                checked={status.isActive} 
                onCheckedChange={handleToggleSecurity} 
                disabled={loading || status.emergencyMode}
              />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium">Stealth Protection</div>
                <div className="text-sm text-muted-foreground">
                  Automatically hides app during threats
                </div>
              </div>
              <Badge variant={status.stealthMode ? "destructive" : "outline"}>
                {status.stealthMode ? "ACTIVE" : "STANDBY"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium">Evidence Recording</div>
                <div className="text-sm text-muted-foreground">
                  {status.emergencyMode ? "Currently recording evidence" : "Activated during emergencies"}
                </div>
              </div>
              <FileVideo className={cn(
                "h-4 w-4",
                status.emergencyMode ? "text-red-500 animate-pulse" : "text-muted-foreground"
              )} />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium">Alert System</div>
                <div className="text-sm text-muted-foreground">
                  {status.emergencyMode ? "Alerts dispatched to contacts" : "Ready to send emergency alerts"}
                </div>
              </div>
              <Send className={cn(
                "h-4 w-4",
                status.emergencyMode ? "text-red-500" : "text-muted-foreground"
              )} />
            </div>
          </div>
        </CardContent>
        
        {status.isActive && !status.emergencyMode && (
          <CardFooter className="border-t pt-4 flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={handleTestEmergency}
              className="w-full sm:w-auto"
            >
              Test Emergency Mode
            </Button>
            <Button 
              variant="default"
              className="w-full sm:w-auto"
              onClick={() => {}}
            >
              Configure Settings
              <MoveUpRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default SecuritySystemControls;
