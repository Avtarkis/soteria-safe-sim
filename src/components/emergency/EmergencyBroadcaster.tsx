
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Send, Users, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface EmergencyBroadcasterProps {
  hasBeenSent: boolean;
  onSendAlert: () => void;
}

const EmergencyBroadcaster: React.FC<EmergencyBroadcasterProps> = ({ 
  hasBeenSent, 
  onSendAlert 
}) => {
  const [sending, setSending] = useState(false);
  const [neighborCount, setNeighborCount] = useState<number | null>(null);

  const handleSendAlert = () => {
    setSending(true);
    
    // Simulate sending alerts to nearby devices
    setTimeout(() => {
      // In a real implementation, this would use a service like:
      // - WebRTC for peer-to-peer connections with nearby devices
      // - A backend service to send SMS messages to registered users in the area
      // - Push notifications to other app users within the radius
      
      const randomCount = Math.floor(Math.random() * 5) + 3; // Between 3-7 neighbors
      setNeighborCount(randomCount);
      onSendAlert();
      setSending(false);
      
      toast({
        title: "Emergency Alert Sent",
        description: `Your alert has been broadcast to ${randomCount} neighbors within 200m.`,
      });
    }, 2000);
  };

  return (
    <div className={cn(
      "p-4 rounded-lg transition-all duration-300",
      hasBeenSent ? "bg-threat-high/20" : "bg-secondary/40"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell className={cn(
            "h-5 w-5",
            hasBeenSent ? "text-threat-high" : "text-muted-foreground"
          )} />
          <h3 className="font-medium">Neighbor Alert System</h3>
        </div>
      </div>
      
      {hasBeenSent ? (
        <div className="bg-secondary/30 p-3 rounded-md mb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                Alert sent to{" "}
                {neighborCount !== null ? `${neighborCount} neighbors` : "nearby residents"}
              </span>
            </div>
            <CheckCheck className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Your emergency alert has been broadcast to all devices within a 200m radius.
          </p>
        </div>
      ) : (
        <p className="text-sm mb-3">
          Broadcast an emergency alert to neighbors and nearby people within a 200m radius, 
          including your current location and emergency status.
        </p>
      )}
      
      <div className="flex justify-center">
        <Button
          variant={hasBeenSent ? "outline" : "default"}
          onClick={handleSendAlert}
          disabled={sending || hasBeenSent}
          className="gap-1 w-full"
        >
          {sending ? (
            <>
              <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
              <span>Sending Alert...</span>
            </>
          ) : hasBeenSent ? (
            <>
              <CheckCheck className="h-4 w-4" />
              <span>Alert Sent</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Send Neighborhood Alert</span>
            </>
          )}
        </Button>
      </div>
      
      <p className="mt-2 text-xs text-muted-foreground">
        {hasBeenSent 
          ? "Neighbors have been notified of your emergency situation." 
          : "This sends an anonymous alert to all compatible devices in your vicinity."}
      </p>
    </div>
  );
};

export default EmergencyBroadcaster;
