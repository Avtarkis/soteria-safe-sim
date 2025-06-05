
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

      const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Deepgram transcription failed: ${response.status}`);
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
      // Note: Deepgram doesn't have built-in sentiment analysis
      // This is a placeholder implementation
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
        // Fallback to simple keyword-based sentiment analysis
        const negativeWords = ['help', 'emergency', 'danger', 'scared', 'threat'];
        const hasNegative = negativeWords.some(word => text.toLowerCase().includes(word));
        
        return {
          sentiment: hasNegative ? 'negative' : 'neutral',
          confidence: hasNegative ? 0.8 : 0.5
        };
      }

      const data = await response.json();
      return {
        sentiment: data.results?.sentiment?.sentiment || 'neutral',
        confidence: data.results?.sentiment?.confidence || 0.5
      };
    } catch (error) {
      console.error('Deepgram sentiment analysis error:', error);
      // Fallback sentiment analysis
      const negativeWords = ['help', 'emergency', 'danger', 'scared', 'threat'];
      const hasNegative = negativeWords.some(word => text.toLowerCase().includes(word));
      
      return {
        sentiment: hasNegative ? 'negative' : 'neutral',
        confidence: hasNegative ? 0.8 : 0.5
      };
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
          model: 'aura-asteria-en',
          voice: options.voice || 'aura-asteria-en',
          speed: options.speed || 1.0
        })
      });

      if (!response.ok) {
        throw new Error(`Deepgram speech synthesis failed: ${response.status}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Deepgram speech synthesis error:', error);
      throw error;
    }
  }
}

export const enhancedDeepgramService = new EnhancedDeepgramService({
  apiKey: '33e343e49d829f70a8916cfb9dc96f238d5d3104',
  model: 'nova-2'
});
