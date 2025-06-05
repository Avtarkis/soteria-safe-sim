
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OpenAIService {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-3.5-turbo') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  async processNaturalLanguage(text: string): Promise<{
    intent: string;
    entities: Record<string, any>;
    confidence: number;
  }> {
    try {
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: `You are a natural language understanding system for an emergency safety app. 
          Analyze the user's text and return a JSON response with:
          - intent: the main intent (emergency, help, status, location, etc.)
          - entities: any important entities extracted
          - confidence: confidence score 0-1
          
          Focus on emergency-related intents and safety commands.`
        },
        {
          role: 'user',
          content: text
        }
      ];

      const response = await this.generateResponse(messages);
      
      try {
        return JSON.parse(response);
      } catch {
        // Fallback if response isn't valid JSON
        return {
          intent: 'unknown',
          entities: {},
          confidence: 0.3
        };
      }
    } catch (error) {
      console.error('NLU processing error:', error);
      return {
        intent: 'unknown',
        entities: {},
        confidence: 0.1
      };
    }
  }
}

export const openaiService = new OpenAIService('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');
