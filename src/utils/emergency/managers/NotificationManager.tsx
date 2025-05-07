
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import React from 'react';
import { EmergencyEvent } from '../types';
import { getEmergencyTitle } from '../handlers/eventProcessors';

export class NotificationManager {
  /**
   * Display an emergency countdown notification
   */
  public static showCountdownNotification(
    countdown: number,
    onCancel: () => void
  ): void {
    toast({
      title: "Emergency Countdown Started",
      description: `Emergency actions will be triggered in ${countdown} seconds. Tap to cancel.`,
      action: <ToastAction altText="Cancel emergency countdown" onClick={onCancel}>Cancel</ToastAction>,
      duration: 10000, // 10 seconds
    });
  }
  
  /**
   * Display a cancellation notification
   */
  public static showCancellationNotification(): void {
    toast({
      title: "Emergency Cancelled",
      description: "Emergency response actions have been cancelled.",
    });
  }
  
  /**
   * Display an emergency notification
   */
  public static showEmergencyNotification(event: EmergencyEvent): void {
    const title = getEmergencyTitle(event);
    const description = event.details || 'Emergency actions are being taken.';
    
    toast({
      title,
      description,
      variant: "destructive",
      duration: 30000, // 30 seconds
    });
  }
  
  /**
   * Display an emergency call notification
   */
  public static showEmergencyCallNotification(): void {
    toast({
      title: "Emergency Call",
      description: "Initiating emergency call to your contacts...",
    });
  }
  
  /**
   * Display an emergency SMS notification
   */
  public static showEmergencySMSNotification(): void {
    toast({
      title: "Emergency SMS",
      description: "Sending emergency SMS to your contacts...",
    });
  }
  
  /**
   * Display an SOS alert notification
   */
  public static showSOSNotification(): void {
    toast({
      title: "SOS Alert Activated",
      description: "Emergency services have been notified of your situation.",
    });
  }
}
