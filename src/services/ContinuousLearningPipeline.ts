import { WeaponDetectionTransferLearning, TrainingData, ModelMetrics } from './WeaponDetectionTransferLearning';
import { WeaponDetectionResult } from './ProductionWeaponDetectionService';
import * as tf from '@tensorflow/tfjs';

export interface LearningConfig {
  retrainingThreshold: number; // Number of new samples before retraining
  confidenceThreshold: number; // Minimum confidence for using predictions as training data
  maxDatasetSize: number; // Maximum number of samples to keep
  retrainingInterval: number; // Hours between automatic retraining
  enableActiveRelearning: boolean;
}

export interface DataSample {
  imageData: ImageData;
  prediction: WeaponDetectionResult;
  userFeedback?: 'correct' | 'incorrect' | 'partial';
  timestamp: number;
  source: 'user_upload' | 'live_detection' | 'manual_annotation';
}

export class ContinuousLearningPipeline {
  private config: LearningConfig;
  private learningModel: WeaponDetectionTransferLearning;
  private dataBuffer: DataSample[] = [];
  private retrainingTimer: NodeJS.Timeout | null = null;
  private isRetraining = false;
  private modelVersion = 1;

  constructor() {
    this.config = {
      retrainingThreshold: 100,
      confidenceThreshold: 0.8,
      maxDatasetSize: 10000,
      retrainingInterval: 24, // 24 hours
      enableActiveRelearning: true
    };

    this.learningModel = new WeaponDetectionTransferLearning();
    this.loadStoredData();
    this.startAutomaticRetraining();
  }

  public async initialize(): Promise<boolean> {
    try {
      console.log('Initializing continuous learning pipeline...');
      
      // Load or create the base model
      const modelLoaded = await this.learningModel.loadModel('weapon-detection-continuous');
      if (!modelLoaded) {
        console.log('No existing model found, initializing new model...');
        await this.learningModel.loadPretrainedModel();
        await this.learningModel.createTransferLearningModel();
      }

      console.log('Continuous learning pipeline initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize continuous learning pipeline:', error);
      return false;
    }
  }

  public addTrainingSample(sample: DataSample): void {
    // Validate sample quality
    if (!this.isValidSample(sample)) {
      console.warn('Invalid training sample rejected');
      return;
    }

    // Add to buffer
    this.dataBuffer.push(sample);
    
    // Limit buffer size
    if (this.dataBuffer.length > this.config.maxDatasetSize) {
      // Remove oldest samples, keeping diverse data
      this.dataBuffer = this.selectDiverseSamples(this.dataBuffer, this.config.maxDatasetSize);
    }

    // Save to persistent storage
    this.saveDataBuffer();

    console.log(`Training sample added. Buffer size: ${this.dataBuffer.length}`);

    // Check if retraining threshold is reached
    if (this.shouldTriggerRetraining()) {
      this.triggerRetraining();
    }
  }

  public addUserFeedback(predictionId: string, feedback: 'correct' | 'incorrect' | 'partial'): void {
    const sample = this.dataBuffer.find(s => 
      s.prediction.timestamp.toString() === predictionId
    );

    if (sample) {
      sample.userFeedback = feedback;
      this.saveDataBuffer();
      
      console.log(`User feedback "${feedback}" added for prediction ${predictionId}`);
      
      // If feedback indicates incorrect prediction, prioritize for retraining
      if (feedback === 'incorrect') {
        this.triggerRetraining();
      }
    }
  }

  private isValidSample(sample: DataSample): boolean {
    // Check confidence threshold
    if (sample.prediction.confidence < this.config.confidenceThreshold && !sample.userFeedback) {
      return false;
    }

    // Check image quality
    if (!sample.imageData || sample.imageData.width < 100 || sample.imageData.height < 100) {
      return false;
    }

    // Check for duplicate or very similar samples
    if (this.isDuplicateSample(sample)) {
      return false;
    }

    return true;
  }

  private isDuplicateSample(newSample: DataSample): boolean {
    // Simple duplicate detection based on timestamp and prediction similarity
    const recentSamples = this.dataBuffer.filter(s => 
      Math.abs(s.timestamp - newSample.timestamp) < 5000 // Within 5 seconds
    );

    return recentSamples.some(s => 
      s.prediction.weaponType === newSample.prediction.weaponType &&
      Math.abs(s.prediction.confidence - newSample.prediction.confidence) < 0.1
    );
  }

  private selectDiverseSamples(samples: DataSample[], maxCount: number): DataSample[] {
    // Implement diversity selection to maintain balanced dataset
    const grouped = new Map<string, DataSample[]>();
    
    // Group by weapon type
    samples.forEach(sample => {
      const key = sample.prediction.weaponType;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(sample);
    });

    const result: DataSample[] = [];
    const samplesPerType = Math.floor(maxCount / grouped.size);

    // Select diverse samples from each type
    grouped.forEach((typeSamples, type) => {
      // Sort by confidence and user feedback
      typeSamples.sort((a, b) => {
        if (a.userFeedback === 'correct' && b.userFeedback !== 'correct') return -1;
        if (b.userFeedback === 'correct' && a.userFeedback !== 'correct') return 1;
        return b.prediction.confidence - a.prediction.confidence;
      });

      result.push(...typeSamples.slice(0, samplesPerType));
    });

    return result.slice(0, maxCount);
  }

  private shouldTriggerRetraining(): boolean {
    if (this.isRetraining) return false;
    
    // Check if we have enough new samples
    const newSamples = this.dataBuffer.filter(s => 
      !s.userFeedback || s.userFeedback !== 'correct'
    );

    if (newSamples.length >= this.config.retrainingThreshold) {
      return true;
    }

    // Check for critical feedback
    const incorrectSamples = this.dataBuffer.filter(s => 
      s.userFeedback === 'incorrect'
    );

    if (incorrectSamples.length >= 10) { // Threshold for critical retraining
      return true;
    }

    return false;
  }

  public async triggerRetraining(): Promise<boolean> {
    if (this.isRetraining) {
      console.log('Retraining already in progress');
      return false;
    }

    try {
      this.isRetraining = true;
      console.log('Starting model retraining...');

      // Prepare training data from buffer
      const trainingData = await this.prepareTrainingDataFromBuffer();
      if (trainingData.length < 50) {
        console.log('Insufficient training data for retraining');
        return false;
      }

      // Split data into training and validation
      const splitIndex = Math.floor(trainingData.length * 0.8);
      const trainData = trainingData.slice(0, splitIndex);
      const valData = trainingData.slice(splitIndex);

      // Perform incremental training
      const metrics = await this.learningModel.trainModel(trainData, valData, 10, 8);

      // Evaluate model performance
      const lastMetrics = metrics[metrics.length - 1];
      console.log(`Retraining completed. Final accuracy: ${lastMetrics.accuracy.toFixed(4)}`);

      // Save updated model
      this.modelVersion++;
      await this.learningModel.saveModel(`weapon-detection-continuous-v${this.modelVersion}`);

      // Clear processed samples from buffer
      this.clearProcessedSamples();

      return true;
    } catch (error) {
      console.error('Retraining failed:', error);
      return false;
    } finally {
      this.isRetraining = false;
    }
  }

  private async prepareTrainingDataFromBuffer(): Promise<TrainingData[]> {
    const trainingData: TrainingData[] = [];

    for (const sample of this.dataBuffer) {
      try {
        // Convert ImageData to tensor
        const canvas = document.createElement('canvas');
        canvas.width = 416;
        canvas.height = 416;
        const ctx = canvas.getContext('2d')!;
        
        // Create temporary canvas with original image
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = sample.imageData.width;
        tempCanvas.height = sample.imageData.height;
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCtx.putImageData(sample.imageData, 0, 0);
        
        // Resize to 416x416
        ctx.drawImage(tempCanvas, 0, 0, 416, 416);
        
        // Convert to tensor
        const imageTensor = tf.browser.fromPixels(canvas).div(255.0);

        // Create annotation from prediction
        const annotation = {
          bbox: [
            sample.prediction.boundingBox.x,
            sample.prediction.boundingBox.y,
            sample.prediction.boundingBox.width,
            sample.prediction.boundingBox.height
          ] as [number, number, number, number],
          class: sample.prediction.weaponType,
          confidence: sample.prediction.confidence
        };

        trainingData.push({
          image: imageTensor,
          annotations: [annotation]
        });
      } catch (error) {
        console.error('Error preparing training data:', error);
      }
    }

    return trainingData;
  }

  private clearProcessedSamples(): void {
    // Keep samples with user feedback for future reference
    this.dataBuffer = this.dataBuffer.filter(s => 
      s.userFeedback && s.userFeedback !== 'incorrect'
    );
    this.saveDataBuffer();
  }

  private startAutomaticRetraining(): void {
    const intervalMs = this.config.retrainingInterval * 60 * 60 * 1000; // Convert hours to ms
    
    this.retrainingTimer = setInterval(() => {
      if (this.config.enableActiveRelearning && this.shouldTriggerRetraining()) {
        this.triggerRetraining();
      }
    }, intervalMs);
  }

  private saveDataBuffer(): void {
    try {
      // Save only metadata to localStorage (not full image data)
      const metadata = this.dataBuffer.map(sample => ({
        timestamp: sample.timestamp,
        prediction: sample.prediction,
        userFeedback: sample.userFeedback,
        source: sample.source
      }));
      
      localStorage.setItem('continuousLearningBuffer', JSON.stringify(metadata));
    } catch (error) {
      console.error('Failed to save data buffer:', error);
    }
  }

  private loadStoredData(): void {
    try {
      const stored = localStorage.getItem('continuousLearningBuffer');
      if (stored) {
        const metadata = JSON.parse(stored);
        console.log(`Loaded ${metadata.length} stored training samples metadata`);
      }
    } catch (error) {
      console.error('Failed to load stored data:', error);
    }
  }

  public updateConfig(newConfig: Partial<LearningConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Continuous learning config updated:', this.config);
  }

  public getConfig(): LearningConfig {
    return { ...this.config };
  }

  public getBufferStats(): { total: number; withFeedback: number; correct: number; incorrect: number } {
    return {
      total: this.dataBuffer.length,
      withFeedback: this.dataBuffer.filter(s => s.userFeedback).length,
      correct: this.dataBuffer.filter(s => s.userFeedback === 'correct').length,
      incorrect: this.dataBuffer.filter(s => s.userFeedback === 'incorrect').length
    };
  }

  public dispose(): void {
    if (this.retrainingTimer) {
      clearInterval(this.retrainingTimer);
    }
    this.isRetraining = false;
  }
}

export const continuousLearningPipeline = new ContinuousLearningPipeline();
export default continuousLearningPipeline;
