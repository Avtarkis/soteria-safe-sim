
import { connectivityService } from './connectivity';
import { fallbackProcessor } from './fallbackProcessor';
import { deepgramService } from '@/services/deepgramService';
import { ProcessedCommand } from './types';

export class HybridCommandProcessor {
  static async processCommand(audioData: Blob): Promise<ProcessedCommand | null> {
    try {
      const networkStatus = connectivityService.getCurrentStatus();
      
      // Use cloud processing if network is good
      if (networkStatus.quality === 'good' || networkStatus.quality === 'excellent') {
        try {
          const cloudResult = await deepgramService.transcribeAudio(audioData);
          if (cloudResult && cloudResult.transcript) {
            return fallbackProcessor.processText(cloudResult.transcript);
          }
        } catch (error) {
          console.warn('Cloud processing failed, falling back to local:', error);
        }
      }
      
      // Fallback to local processing
      return await fallbackProcessor.processAudio(audioData);
    } catch (error) {
      console.error('Hybrid processing failed:', error);
      return null;
    }
  }
}
