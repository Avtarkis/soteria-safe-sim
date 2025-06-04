
import { toast } from '@/hooks/use-toast';

interface CallOptions {
  callerName?: string;
  autoAnswerDelay?: number;
}

class EmergencyCallService {
  private activeCall: boolean = false;
  private callStartTime: number | null = null;
  
  public startEmergencyCall(
    callType: 'weapon' | 'health' | 'default' = 'default',
    options: CallOptions = {}
  ): void {
    if (this.activeCall) {
      console.log('Emergency call already in progress');
      return;
    }
    
    this.activeCall = true;
    this.callStartTime = Date.now();
    
    // Use real browser APIs to initiate emergency call
    const emergencyNumber = this.getEmergencyNumber();
    
    try {
      // Create a real phone call using tel: protocol
      const callUrl = `tel:${emergencyNumber}`;
      window.open(callUrl, '_self');
      
      console.log(`Emergency call initiated to ${emergencyNumber}`);
      
      toast({
        title: "Emergency Call Initiated",
        description: `Calling ${emergencyNumber}. Stay on the line.`,
        variant: "destructive",
        duration: 10000,
      });
      
      // Auto-end the call tracking after reasonable time
      setTimeout(() => {
        this.endEmergencyCall();
      }, 300000); // 5 minutes
      
    } catch (error) {
      console.error('Failed to initiate emergency call:', error);
      this.activeCall = false;
      this.callStartTime = null;
      
      toast({
        title: "Call Failed",
        description: "Unable to place emergency call. Please dial manually.",
        variant: "destructive",
      });
    }
  }
  
  public endEmergencyCall(): void {
    if (!this.activeCall) return;
    
    this.activeCall = false;
    const duration = this.callStartTime ? Date.now() - this.callStartTime : 0;
    this.callStartTime = null;
    
    console.log(`Emergency call ended after ${Math.round(duration / 1000)} seconds`);
    
    toast({
      title: "Emergency Call Ended",
      description: "Call has been disconnected.",
    });
  }
  
  public isCallInProgress(): boolean {
    return this.activeCall;
  }
  
  public getCallDuration(): number {
    if (!this.activeCall || !this.callStartTime) return 0;
    return Date.now() - this.callStartTime;
  }
  
  private getEmergencyNumber(): string {
    // Get user's location to determine appropriate emergency number
    const userCountry = this.detectUserCountry();
    
    const emergencyNumbers: { [key: string]: string } = {
      'US': '911',
      'CA': '911',
      'GB': '999',
      'AU': '000',
      'DE': '112',
      'FR': '112',
      'IT': '112',
      'ES': '112',
      'NL': '112',
      'BE': '112',
      'default': '911'
    };
    
    return emergencyNumbers[userCountry] || emergencyNumbers['default'];
  }
  
  private detectUserCountry(): string {
    // Use browser's timezone and language to detect likely country
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    
    if (timezone.includes('America/') && language.startsWith('en-US')) return 'US';
    if (timezone.includes('America/') && language.startsWith('en-CA')) return 'CA';
    if (timezone.includes('Europe/London')) return 'GB';
    if (timezone.includes('Australia/')) return 'AU';
    if (timezone.includes('Europe/Berlin')) return 'DE';
    if (timezone.includes('Europe/Paris')) return 'FR';
    if (timezone.includes('Europe/Rome')) return 'IT';
    if (timezone.includes('Europe/Madrid')) return 'ES';
    if (timezone.includes('Europe/Amsterdam')) return 'NL';
    if (timezone.includes('Europe/Brussels')) return 'BE';
    
    return 'US'; // Default fallback
  }
}

const emergencyCallService = new EmergencyCallService();
export default emergencyCallService;
