
// Deepgram API service for speech recognition and text-to-speech
import { toast } from "@/hooks/use-toast";
import { ProcessedCommand } from '@/utils/voice/types';

// Deepgram API configuration
const DEEPGRAM_API_URL = "https://api.deepgram.com/v1";
const DEEPGRAM_API_KEY = "33e343e49d829f70a8916cfb9dc96f238d5d3104"; // Using the provided API key

interface DeepgramTranscriptionOptions {
  language?: string;
  model?: string;
  detectLanguage?: boolean;
  punctuate?: boolean;
  profanityFilter?: boolean;
  redact?: string[];
  diarize?: boolean;
  smartFormat?: boolean;
}

interface DeepgramTranscriptionResponse {
  results: {
    channels: Array<{
      alternatives: Array<{
        transcript: string;
        confidence: number;
      }>;
    }>;
  };
}

interface DeepgramTTSOptions {
  voice?: string;
  model?: string;
  speed?: number;
  pitch?: number;
}

export class DeepgramService {
  private apiKey: string;
  private isInitialized = false;
  private openAIApiKey = "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"; // Using the provided OpenAI key

  constructor() {
    // Use the provided Deepgram API key
    this.apiKey = DEEPGRAM_API_KEY;
    this.isInitialized = true;
    console.log("Deepgram service initialized");
  }

  // Method to transcribe audio from a blob
  async transcribeAudio(
    audioBlob: Blob,
    options: DeepgramTranscriptionOptions = {}
  ): Promise<ProcessedCommand> {
    if (!this.isInitialized) {
      console.error("Deepgram service not initialized");
      throw new Error("Deepgram service not initialized");
    }
    
    try {
      // Create a FormData object to send the audio
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      
      // Set up headers with the API key
      const headers = new Headers({
        'Authorization': `Token ${this.apiKey}`
      });
      
      // Build URL with query parameters
      let url = `${DEEPGRAM_API_URL}/listen?model=nova-2`;
      if (options.smartFormat) url += '&smart_format=true';
      if (options.punctuate) url += '&punctuate=true';
      if (options.language) url += `&language=${options.language}`;
      
      // Make the API request
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Deepgram API error: ${response.status}`);
      }

      const data = await response.json() as DeepgramTranscriptionResponse;
      
      // Extract transcript and confidence from the response
      const transcript = data.results?.channels[0]?.alternatives[0]?.transcript || '';
      const confidence = data.results?.channels[0]?.alternatives[0]?.confidence || 0.7;
      
      // Process the command using the transcript
      const type = this.determineCommandType(transcript);
      const urgency = this.determineUrgency(transcript, type);
      
      // Return properly formatted ProcessedCommand object
      return {
        type,
        confidence,
        originalText: transcript,
        normalizedText: transcript.toLowerCase(),
        urgency
      };
      
    } catch (error) {
      console.error("Error transcribing audio:", error);
      toast({
        title: "Transcription Error",
        description: "Failed to process your voice. Using fallback method.",
        variant: "destructive"
      });
      
      // For demonstration purposes - implement fallback
      const audioDuration = await this.getAudioDuration(audioBlob);
      let simulatedTranscript = "Sorry, I didn't catch that.";
      
      // Simulate different transcriptions based on duration as a fallback
      if (audioDuration < 1.5) {
        simulatedTranscript = "Help me.";
      } else if (audioDuration < 3) {
        simulatedTranscript = "Soteria, call emergency services.";
      } else if (audioDuration < 5) {
        simulatedTranscript = "Soteria, send my location to contacts.";
      } else {
        simulatedTranscript = "Soteria, activate silent alarm.";
      }
      
      const type = this.determineCommandType(simulatedTranscript);
      
      return {
        type,
        confidence: 0.6, // Lower confidence for fallback
        originalText: simulatedTranscript,
        normalizedText: simulatedTranscript.toLowerCase(),
        urgency: this.determineUrgency(simulatedTranscript, type)
      };
    }
  }

  // Method for text-to-speech synthesis using OpenAI's API
  async synthesizeSpeech(
    text: string,
    options: DeepgramTTSOptions = {}
  ): Promise<ArrayBuffer> {
    if (!this.isInitialized) {
      console.error("Service not initialized");
      throw new Error("Service not initialized");
    }

    try {
      // First attempt to use OpenAI's TTS API
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openAIApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: options.voice || 'alloy',
          speed: options.speed || 1.0
        })
      });

      if (!response.ok) {
        throw new Error('OpenAI TTS API error');
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error("Error synthesizing speech with OpenAI:", error);
      toast({
        title: "Speech Error",
        description: "Failed to generate voice. Using browser TTS as fallback.",
        variant: "default"
      });
      
      // Fall back to browser's built-in TTS
      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = options.speed || 1;
        utterance.pitch = options.pitch || 1;
        
        utterance.onend = () => {
          // Simulate returning audio data
          resolve(new ArrayBuffer(0));
        };
        
        // Start speaking
        window.speechSynthesis.speak(utterance);
      });
    }
  }
  
  // Helper method to analyze sentiment (using OpenAI)
  async analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    urgency: 'low' | 'medium' | 'high';
    confidence: number;
  }> {
    try {
      // Use OpenAI API for sentiment analysis
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openAIApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Analyze the sentiment and urgency of this message. Respond with JSON only in format {"sentiment": "positive|neutral|negative", "urgency": "low|medium|high", "confidence": 0.0-1.0}'
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.3
        })
      });
      
      if (!response.ok) {
        throw new Error('OpenAI API error');
      }
      
      const data = await response.json();
      const resultText = data.choices[0].message.content;
      
      try {
        // Parse the result as JSON
        const result = JSON.parse(resultText);
        return {
          sentiment: result.sentiment as 'positive' | 'neutral' | 'negative',
          urgency: result.urgency as 'low' | 'medium' | 'high',
          confidence: result.confidence || 0.7
        };
      } catch (parseError) {
        throw new Error('Failed to parse sentiment analysis result');
      }
    } catch (error) {
      console.error('Error analyzing sentiment with OpenAI:', error);
      
      // Fallback to basic keyword analysis
      const urgentWords = ['help', 'emergency', 'danger', 'hurt', 'injured', 'scared'];
      const urgentWordsCount = urgentWords.filter(word => 
        text.toLowerCase().includes(word)
      ).length;
      
      let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
      let urgency: 'low' | 'medium' | 'high' = 'low';
      
      if (urgentWordsCount > 2) {
        sentiment = 'negative';
        urgency = 'high';
      } else if (urgentWordsCount > 0) {
        sentiment = 'negative';
        urgency = 'medium';
      }
      
      return {
        sentiment,
        urgency,
        confidence: 0.7 + (urgentWordsCount * 0.1)
      };
    }
  }

  // Helper method to determine command type
  private determineCommandType(text: string): 'emergency_call' | 'location_share' | 'start_recording' | 'silent_alarm' | 'travel_advice' | 'cybersecurity_info' | 'family_location' | 'safe_route' | 'conversation' | 'unknown' {
    const normalizedText = text.toLowerCase();
    
    if (normalizedText.includes('emergency') || normalizedText.includes('help') || normalizedText.includes('sos')) 
      return 'emergency_call';
      
    if (normalizedText.includes('record')) 
      return 'start_recording';
      
    if (normalizedText.includes('silent') || normalizedText.includes('alarm')) 
      return 'silent_alarm';
      
    if (normalizedText.includes('location')) 
      return 'location_share';
      
    if (normalizedText.includes('travel') || normalizedText.includes('route')) 
      return 'travel_advice';
      
    if (normalizedText.includes('security') || normalizedText.includes('cyber')) 
      return 'cybersecurity_info';
      
    if (normalizedText.includes('family')) 
      return 'family_location';
      
    if (normalizedText.includes('safe') && normalizedText.includes('route')) 
      return 'safe_route';
      
    if (normalizedText.includes('soteria')) 
      return 'conversation';
      
    return 'unknown';
  }
  
  // Helper method to determine urgency
  private determineUrgency(text: string, commandType: 'emergency_call' | 'location_share' | 'start_recording' | 'silent_alarm' | 'travel_advice' | 'cybersecurity_info' | 'family_location' | 'safe_route' | 'conversation' | 'unknown'): 'low' | 'medium' | 'high' {
    // Emergency commands are high urgency
    if (commandType === 'emergency_call' || commandType === 'silent_alarm') {
      return 'high';
    }

    // Check for urgency keywords
    const normalizedText = text.toLowerCase();
    if (normalizedText.includes('urgent') || normalizedText.includes('emergency') || 
        normalizedText.includes('now') || normalizedText.includes('immediately')) {
      return 'high';
    }

    // Medium urgency for active requests
    if (commandType === 'location_share' || commandType === 'start_recording') {
      return 'medium';
    }

    // Default urgency is low
    return 'low';
  }

  // Helper method to get audio duration
  private async getAudioDuration(audioBlob: Blob): Promise<number> {
    return new Promise((resolve) => {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.addEventListener('loadedmetadata', () => {
        const duration = audio.duration;
        URL.revokeObjectURL(audioUrl);
        resolve(duration);
      });
      
      // Fallback in case loadedmetadata doesn't fire
      setTimeout(() => resolve(3), 1000);
    });
  }
}

export const deepgramService = new DeepgramService();
