
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

export interface WeaponDetectionResult {
  weaponDetected: boolean;
  weaponType: 'firearm' | 'knife' | 'blunt_object' | 'unknown';
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  timestamp: number;
}

export interface WeaponDetectionConfig {
  confidenceThreshold: number;
  modelEndpoint: string;
  enableContinuousDetection: boolean;
  detectionInterval: number;
  enableCloudAnalysis: boolean;
}

export class WeaponDetectionCore {
  private model: tf.GraphModel | null = null;
  private isInitialized = false;
  private config: WeaponDetectionConfig;

  constructor(config: WeaponDetectionConfig) {
    this.config = config;
  }

  public async initialize(): Promise<boolean> {
    try {
      console.log('Initializing weapon detection core...');
      
      await tf.ready();
      this.model = await tf.loadGraphModel(this.config.modelEndpoint);
      
      console.log('Model loaded successfully');
      
      const dummyInput = tf.zeros([1, 416, 416, 3]);
      await this.model.predict(dummyInput);
      dummyInput.dispose();
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize weapon detection core:', error);
      return false;
    }
  }

  public async detectWeapons(imageTensor: tf.Tensor): Promise<WeaponDetectionResult> {
    if (!this.model || !this.isInitialized) {
      throw new Error('Detection core not initialized');
    }

    const predictions = await this.model.predict(imageTensor) as tf.Tensor;
    const predictionData = await predictions.data();
    predictions.dispose();

    return this.processPredictions(predictionData);
  }

  private processPredictions(predictions: Float32Array | Int32Array | Uint8Array): WeaponDetectionResult {
    let maxConfidence = 0;
    let weaponType: WeaponDetectionResult['weaponType'] = 'unknown';
    let boundingBox = { x: 0, y: 0, width: 0, height: 0 };

    for (let i = 0; i < predictions.length; i += 6) {
      const confidence = predictions[i + 4] as number;
      const classId = predictions[i + 5] as number;
      
      if (confidence > maxConfidence && confidence > this.config.confidenceThreshold) {
        maxConfidence = confidence;
        
        switch (classId) {
          case 0:
            weaponType = 'firearm';
            break;
          case 1:
            weaponType = 'knife';
            break;
          case 2:
            weaponType = 'blunt_object';
            break;
          default:
            weaponType = 'unknown';
        }

        boundingBox = {
          x: predictions[i] as number,
          y: predictions[i + 1] as number,
          width: predictions[i + 2] as number,
          height: predictions[i + 3] as number
        };
      }
    }

    return {
      weaponDetected: maxConfidence > this.config.confidenceThreshold,
      weaponType,
      confidence: maxConfidence,
      boundingBox,
      timestamp: Date.now()
    };
  }

  public updateConfig(newConfig: Partial<WeaponDetectionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): WeaponDetectionConfig {
    return { ...this.config };
  }

  public isActive(): boolean {
    return this.isInitialized;
  }
}
