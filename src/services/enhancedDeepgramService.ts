
interface DeepgramConfig {
  apiKey: string;
  model?: string;
}

export class EnhancedDeepgramService {
  private apiKey: string;
  private model: string;

  constructor(config: DeepgramConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'nova-2';
  }

  async transcribeAudioStream(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('https://api.deepgram.com/v1/listen', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const data = await response.json();
      return data.results?.channels[0]?.alternatives[0]?.transcript || '';
    } catch (error) {
      console.error('Deepgram transcription error:', error);
      throw error;
    }
  }

  async analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
  }> {
    try {
      const response = await fetch('https://api.deepgram.com/v1/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model: this.model,
          features: ['sentiment']
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze sentiment');
      }

      const data = await response.json();
      return {
        sentiment: data.results.sentiment.sentiment,
        confidence: data.results.sentiment.confidence
      };
    } catch (error) {
      console.error('Deepgram sentiment analysis error:', error);
      throw error;
    }
  }

  async synthesizeSpeech(text: string, options: {
    voice?: string;
    speed?: number;
  } = {}): Promise<ArrayBuffer> {
    try {
      const response = await fetch('https://api.deepgram.com/v1/speak', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: options.voice || 'female-1',
          speed: options.speed || 1.0
        })
      });

      if (!response.ok) {
        throw new Error('Failed to synthesize speech');
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Deepgram speech synthesis error:', error);
      throw error;
    }
  }
}

export const enhancedDeepgramService = new EnhancedDeepgramService({
  apiKey: 'YOUR_DEEPGRAM_API_KEY', // This should be handled securely
  model: 'nova-2'
});
