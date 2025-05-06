
import * as tf from '@tensorflow/tfjs';
import ModelManager from './ModelManager';

export interface AudioThreatResult {
  detected: boolean;
  type: string;
  confidence: number;
  timestamp: number;
}

export interface AudioClassificationResult {
  label: string;
  score: number;
}

// YAMNet model class mappings for threat sounds
const THREAT_CLASSES = {
  'Gunshot, gunfire': 'gunshot',
  'Machine gun': 'gunshot',
  'Rifle': 'gunshot',
  'Shotgun': 'gunshot',
  'Screaming': 'scream',
  'Cry, sob': 'scream',
  'Crying, sobbing': 'scream',
  'Shriek': 'scream',
  'Shout': 'scream',
  'Explosion': 'explosion',
  'Boom': 'explosion',
  'Breaking': 'glass_breaking',
  'Smash, crash': 'impact',
  'Car alarm': 'alarm',
  'Siren': 'siren',
  'Fire alarm': 'alarm',
  'Emergency vehicle': 'siren',
  'Police car (siren)': 'siren',
  'Ambulance (siren)': 'siren',
  'Fire engine, fire truck (siren)': 'siren'
};

// Confidence thresholds for different threat types
const THREAT_THRESHOLDS: Record<string, number> = {
  'gunshot': 0.6,
  'scream': 0.7,
  'explosion': 0.65,
  'glass_breaking': 0.75,
  'impact': 0.8,
  'alarm': 0.7,
  'siren': 0.7
};

export class AudioThreatDetectionService {
  private static instance: AudioThreatDetectionService;
  private model: tf.GraphModel | tf.LayersModel | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private isRunning = false;
  private lastPredictionTime = 0;
  private predictionInterval = 1000; // ms between predictions
  private audioBuffer: Float32Array[] = [];
  private classNames: string[] = [];
  
  private constructor() {}
  
  public static getInstance(): AudioThreatDetectionService {
    if (!AudioThreatDetectionService.instance) {
      AudioThreatDetectionService.instance = new AudioThreatDetectionService();
    }
    return AudioThreatDetectionService.instance;
  }
  
  public async initialize(): Promise<boolean> {
    try {
      // Load YAMNet model
      this.model = await ModelManager.loadModel(
        'audio',
        'yamnet',
        'https://tfhub.dev/google/tfjs-model/yamnet/tfjs/1'
      );
      
      if (!this.model) {
        console.error('Failed to load YAMNet model');
        return false;
      }
      
      // Load class names
      const response = await fetch('/models/yamnet_class_map.json');
      const classMap = await response.json();
      this.classNames = classMap.map((entry: any) => entry.name);
      
      console.log('Audio threat detection service initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize audio threat detection service:', error);
      return false;
    }
  }
  
  public async startDetection(onThreatDetected: (result: AudioThreatResult) => void): Promise<boolean> {
    if (!this.model) {
      console.error('YAMNet model not loaded');
      return false;
    }
    
    if (this.isRunning) {
      this.stopDetection();
    }
    
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup audio processing
      this.audioContext = new AudioContext();
      this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.processor = this.audioContext.createScriptProcessor(16384, 1, 1);
      
      // Connect the audio graph
      this.mediaStreamSource.connect(this.analyser);
      this.analyser.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      
      // Process audio data
      this.processor.onaudioprocess = (e) => this.processAudio(e, onThreatDetected);
      this.isRunning = true;
      
      console.log('Audio threat detection started');
      return true;
    } catch (error) {
      console.error('Failed to start audio threat detection:', error);
      return false;
    }
  }
  
  public stopDetection(): void {
    if (!this.isRunning) return;
    
    if (this.processor) {
      this.processor.disconnect();
      this.processor.onaudioprocess = null;
      this.processor = null;
    }
    
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    
    if (this.mediaStreamSource) {
      this.mediaStreamSource.disconnect();
      this.mediaStreamSource = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.isRunning = false;
    this.audioBuffer = [];
    console.log('Audio threat detection stopped');
  }
  
  private processAudio(event: AudioProcessingEvent, onThreatDetected: (result: AudioThreatResult) => void): void {
    const now = Date.now();
    
    // Store audio data
    const inputData = event.inputBuffer.getChannelData(0);
    this.audioBuffer.push(new Float32Array(inputData));
    
    // Only perform prediction at the specified interval
    if (now - this.lastPredictionTime < this.predictionInterval) {
      return;
    }
    
    this.lastPredictionTime = now;
    
    // Process audio with TensorFlow model
    this.runInference(onThreatDetected);
  }
  
  private async runInference(onThreatDetected: (result: AudioThreatResult) => void): Promise<void> {
    if (!this.model || this.audioBuffer.length === 0) return;
    
    try {
      // Combine audio buffer chunks
      const combinedBuffer = this.combineAudioBuffers();
      
      // Prepare the input tensor
      const tensor = tf.tensor(combinedBuffer);
      const expandedTensor = tf.expandDims(tensor, 0);
      
      // Run inference
      const predictions = await this.model.predict(expandedTensor);
      
      // Process the predictions
      const scores = await (predictions as tf.Tensor).data();
      
      // Get top predictions
      const topK = 3;
      const topScores = this.getTopK(scores as Float32Array, topK);
      
      // Check if any of the top predictions are threats
      for (const { index, score } of topScores) {
        const label = this.classNames[index] || `Class ${index}`;
        
        // Check if this is a threat class
        const threatType = this.mapToThreatType(label);
        if (!threatType) continue;
        
        const threshold = THREAT_THRESHOLDS[threatType] || 0.7;
        
        // If confidence exceeds threshold, report the threat
        if (score >= threshold) {
          onThreatDetected({
            detected: true,
            type: threatType,
            confidence: score,
            timestamp: Date.now()
          });
          break; // Only report the highest confidence threat
        }
      }
      
      // Clean up tensors
      tf.dispose([tensor, expandedTensor, predictions]);
      
      // Reset audio buffer
      this.audioBuffer = [];
    } catch (error) {
      console.error('Error during audio inference:', error);
    }
  }
  
  private combineAudioBuffers(): Float32Array {
    // Calculate total length
    let totalLength = 0;
    for (const buffer of this.audioBuffer) {
      totalLength += buffer.length;
    }
    
    // Create a combined buffer
    const combinedBuffer = new Float32Array(totalLength);
    
    let offset = 0;
    for (const buffer of this.audioBuffer) {
      combinedBuffer.set(buffer, offset);
      offset += buffer.length;
    }
    
    return combinedBuffer;
  }
  
  private getTopK(values: Float32Array, k: number): Array<{ index: number, score: number }> {
    // Create array of indices and scores
    const valuesAndIndices = values.map((score, index) => ({ score, index }));
    
    // Sort by score in descending order
    valuesAndIndices.sort((a, b) => b.score - a.score);
    
    // Return top k
    return valuesAndIndices.slice(0, k).map(item => ({
      index: item.index,
      score: item.score
    }));
  }
  
  private mapToThreatType(label: string): string | null {
    // Check if the label is in our threat classes map
    for (const [className, threatType] of Object.entries(THREAT_CLASSES)) {
      if (label.includes(className)) {
        return threatType;
      }
    }
    
    return null;
  }
  
  public isDetectionRunning(): boolean {
    return this.isRunning;
  }
}

export default AudioThreatDetectionService.getInstance();
