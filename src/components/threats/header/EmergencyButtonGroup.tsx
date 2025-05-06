import React from 'react';
import { Button } from '@/components/ui/button';
import { PhoneCall, MessageSquare, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const EmergencyButtonGroup = () => {
  const { toast } = useToast();

  const handleEmergencyCall = () => {
    // Existing emergency call function
    try {
      // This will utilize the existing sendSms() function
      document.dispatchEvent(new CustomEvent('emergencyCallTriggered'));
      
      toast({
        title: "Emergency Call",
        description: "Initiating emergency call to your contacts...",
      });
    } catch (error) {
      console.error('Error triggering emergency call:', error);
      
      toast({
        title: "Error",
        description: "Could not initiate emergency call. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleEmergencySMS = () => {
    // Existing emergency SMS function
    try {
      // This will utilize the existing makeCall() function
      document.dispatchEvent(new CustomEvent('emergencySMSTriggered'));
      
      toast({
        title: "Emergency SMS",
        description: "Sending emergency SMS to your contacts...",
      });
    } catch (error) {
      console.error('Error sending emergency SMS:', error);
      
      toast({
        title: "Error",
        description: "Could not send emergency SMS. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSOSAlert = () => {
    try {
      document.dispatchEvent(new CustomEvent('SOSAlertTriggered'));
      
      toast({
        title: "SOS Alert Activated",
        description: "Emergency services have been notified of your situation.",
      });
    } catch (error) {
      console.error('Error triggering SOS alert:', error);
      
      toast({
        title: "Error",
        description: "Could not trigger SOS alert. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="hidden md:flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm"
        className="border-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
        onClick={handleEmergencyCall}
      >
        <PhoneCall className="mr-1 h-4 w-4 text-red-500" />
        Call
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        className="border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30"
        onClick={handleEmergencySMS}
      >
        <MessageSquare className="mr-1 h-4 w-4 text-amber-500" />
        SMS
      </Button>
      
      <Button 
        variant="destructive" 
        size="sm"
        onClick={handleSOSAlert}
      >
        <AlertTriangle className="mr-1 h-4 w-4" />
        SOS
      </Button>
    </div>
  );
};

export default EmergencyButtonGroup;
