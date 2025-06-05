
import { ProcessedCommand } from '@/utils/voice/types';

export interface DeepgramConfig {
  apiKey?: string;
  model: string;
  language: string;
  smartFormat: boolean;
  punctuate: boolean;
}

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
  words?: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

export class DeepgramService {
  private config: DeepgramConfig;
  private isInitialized = false;

  constructor() {
    this.config = {
      apiKey: '33e343e49d829f70a8916cfb9dc96f238d5d3104',
      model: 'nova-2',
      language: 'en-US',
      smartFormat: true,
      punctuate: true
    };
    this.isInitialized = true;
  }

  public async initialize(apiKey?: string): Promise<boolean> {
    try {
      if (apiKey) {
        this.config.apiKey = apiKey;
      }

      this.isInitialized = true;
      console.log('DeepgramService initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize DeepgramService:', error);
      return false;
    }
  }

  public async transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult | null> {
    if (!this.isInitialized || !this.config.apiKey) {
      console.error('DeepgramService not initialized or missing API key');
      return null;
    }

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.config.apiKey}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Deepgram API error: ${response.status}`);
      }

      const data = await response.json();
      const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
      const confidence = data.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0.5;

      return {
        transcript,
        confidence,
        words: data.results?.channels?.[0]?.alternatives?.[0]?.words || []
      };
    } catch (error) {
      console.error('Transcription failed:', error);
      return null;
    }
  }

  public async synthesizeSpeech(text: string, options: {
    voice?: string;
    speed?: number;
    pitch?: number;
  } = {}): Promise<ArrayBuffer | null> {
    if (!this.isInitialized || !this.config.apiKey) {
      console.error('DeepgramService not initialized or missing API key');
      return null;
    }

    try {
      const response = await fetch('https://api.deepgram.com/v1/speak', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model: 'aura-asteria-en',
          voice: options.voice || 'aura-asteria-en',
          speed: options.speed || 1.0
        })
      });

      if (!response.ok) {
        throw new Error(`Deepgram TTS API error: ${response.status}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Speech synthesis failed:', error);
      return null;
    }
  }

  public async processVoiceCommand(transcript: string): Promise<ProcessedCommand | null> {
    try {
      const normalizedText = transcript.toLowerCase().trim();
      
      let commandType: ProcessedCommand['type'] = 'unknown';
      let urgency: ProcessedCommand['urgency'] = 'low';
      let confidence = 0.5;

      // Emergency commands
      if (normalizedText.includes('emergency') || normalizedText.includes('help')) {
        commandType = 'emergency';
        urgency = 'high';
        confidence = 0.9;
      } else if (normalizedText.includes('call') && normalizedText.includes('police')) {
        commandType = 'emergency_call';
        urgency = 'critical';
        confidence = 0.95;
      } else if (normalizedText.includes('danger') || normalizedText.includes('threat')) {
        commandType = 'alert';
        urgency = 'high';
        confidence = 0.85;
      } else if (normalizedText.includes('record')) {
        commandType = 'start_recording';
        urgency = 'medium';
        confidence = 0.8;
      } else if (normalizedText.includes('location')) {
        commandType = 'location_share';
        urgency = 'medium';
        confidence = 0.8;
      } else if (normalizedText.includes('status')) {
        commandType = 'status';
        urgency = 'low';
        confidence = 0.9;
      }

      return {
        type: commandType,
        confidence,
        originalText: transcript,
        normalizedText,
        urgency,
        params: {}
      };
    } catch (error) {
      console.error('Voice command processing failed:', error);
      return null;
    }
  }

  public updateConfig(newConfig: Partial<DeepgramConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): DeepgramConfig {
    return { ...this.config };
  }

  public isReady(): boolean {
    return this.isInitialized;
  }
}

export const deepgramService = new DeepgramService();
