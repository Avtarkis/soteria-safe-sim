
import { ProcessedCommand } from './types';
import { CommandProcessor } from './commands/commandProcessor';
import { connectivityService } from './connectivity';
import { responseCache } from './responseCache';

export class HybridCommandProcessor {
  private static confidenceThreshold = 0.7;

  public static async processCommand(
    text: string,
    audioBlob?: Blob
  ): Promise<ProcessedCommand | null> {
    const cachedResponse = responseCache.get(text);
    if (cachedResponse) {
      try {
        return JSON.parse(cachedResponse) as ProcessedCommand;
      } catch (error) {
        console.error('Error parsing cached response:', error);
      }
    }

    const command = await CommandProcessor.processCommand(text);
    if (command) {
      responseCache.set(text, JSON.stringify(command), command.confidence);
    }
    
    return command;
  }

  public static shouldUseFallback(command: ProcessedCommand): boolean {
    const networkStatus = connectivityService.getCurrentStatus();
    return networkStatus !== 'online' || command.confidence < this.confidenceThreshold;
  }
}
