
import { connectivityService } from './connectivity';
import { FallbackProcessor } from './fallbackProcessor';
import { deepgramService } from '@/services/deepgramService';
import { ProcessedCommand } from './types';

export class HybridCommandProcessor {
  static async processCommand(audioData: Blob): Promise<ProcessedCommand | null> {
    try {
      const networkStatus = connectivityService.getCurrentStatus();
      
      if (networkStatus.quality === 'good' || networkStatus.quality === 'excellent') {
        try {
          const cloudResult = await deepgramService.transcribeAudio(audioData);
          if (cloudResult && cloudResult.transcript) {
            return FallbackProcessor.processText(cloudResult.transcript);
          }
        } catch (error) {
          console.warn('Cloud processing failed, falling back to local:', error);
        }
      }
      
      return FallbackProcessor.processText('fallback text processing');
    } catch (error) {
      console.error('Hybrid processing failed:', error);
      return null;
    }
  }
}
