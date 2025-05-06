
import { toast } from '@/hooks/use-toast';

/**
 * Send an emergency SMS to contacts
 */
export const sendEmergencySMS = (): void => {
  try {
    // Using the existing sendSms function
    document.dispatchEvent(new CustomEvent('sendSms'));
    
    console.log('Emergency SMS sent');
  } catch (error) {
    console.error('Error sending emergency SMS:', error);
  }
};

/**
 * Make an emergency call
 */
export const makeEmergencyCall = (): void => {
  try {
    // Using the existing makeCall function
    document.dispatchEvent(new CustomEvent('makeCall'));
    
    console.log('Emergency call initiated');
  } catch (error) {
    console.error('Error making emergency call:', error);
  }
};

/**
 * Start emergency recording
 */
export const startRecording = (): void => {
  try {
    // Trigger recording system
    document.dispatchEvent(new CustomEvent('startEmergencyRecording'));
    
    console.log('Emergency recording started');
  } catch (error) {
    console.error('Error starting emergency recording:', error);
  }
};

/**
 * Display a notification to the user
 */
export const notifyUser = (title: string, description: string): void => {
  toast({
    title,
    description,
    variant: "destructive",
    duration: 30000,
  });
};

/**
 * Activate emergency siren
 */
export const activateSiren = (): void => {
  try {
    // Trigger siren
    document.dispatchEvent(new CustomEvent('activateEmergencySiren'));
    
    console.log('Emergency siren activated');
  } catch (error) {
    console.error('Error activating emergency siren:', error);
  }
};

/**
 * Broadcast emergency alert to nearby devices
 */
export const broadcastAlert = (): void => {
  try {
    // Broadcast alert to nearby devices
    document.dispatchEvent(new CustomEvent('broadcastEmergencyAlert'));
    
    console.log('Emergency alert broadcasted');
  } catch (error) {
    console.error('Error broadcasting emergency alert:', error);
  }
};
