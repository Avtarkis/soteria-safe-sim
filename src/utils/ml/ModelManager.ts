
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

export interface ModelStatus {
  loaded: boolean;
  name: string;
  type: 'pose' | 'audio' | 'activity';
  version?: string;
  error?: string;
}

export class ModelManager {
  private static instance: ModelManager;
  private models: Map<string, tf.GraphModel | tf.LayersModel> = new Map();
  private modelStatus: Map<string, ModelStatus> = new Map();
  
  private constructor() {
    // Initialize TensorFlow
    this.initializeTensorFlow();
  }
  
  public static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }
  
  private async initializeTensorFlow(): Promise<void> {
    try {
      await tf.setBackend('webgl');
      console.log('Using WebGL backend for TensorFlow.js');
    } catch (e) {
      console.warn('WebGL backend not available, falling back to CPU:', e);
      await tf.setBackend('cpu');
      console.log('Using CPU backend for TensorFlow.js');
    }
    
    await tf.ready();
    console.log('TensorFlow.js is ready');
  }
  
  public async loadModel(
    modelType: 'pose' | 'audio' | 'activity',
    modelName: string,
    modelUrl: string
  ): Promise<tf.GraphModel | tf.LayersModel | null> {
    try {
      console.log(`Loading ${modelType} model: ${modelName}`);
      
      this.modelStatus.set(modelName, {
        loaded: false,
        name: modelName,
        type: modelType,
      });
      
      let model: tf.GraphModel | tf.LayersModel;
      
      // Load the model
      if (modelUrl.endsWith('.json')) {
        model = await tf.loadGraphModel(modelUrl);
      } else {
        model = await tf.loadLayersModel(modelUrl);
      }
      
      this.models.set(modelName, model);
      this.modelStatus.set(modelName, {
        loaded: true,
        name: modelName,
        type: modelType,
        version: '1.0'
      });
      
      console.log(`Successfully loaded ${modelType} model: ${modelName}`);
      return model;
    } catch (error) {
      console.error(`Failed to load ${modelType} model: ${modelName}`, error);
      this.modelStatus.set(modelName, {
        loaded: false,
        name: modelName,
        type: modelType,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }
  
  public getModel(modelName: string): tf.GraphModel | tf.LayersModel | null {
    return this.models.get(modelName) || null;
  }
  
  public getModelStatus(modelName: string): ModelStatus | null {
    return this.modelStatus.get(modelName) || null;
  }
  
  public getAllModelStatus(): ModelStatus[] {
    return Array.from(this.modelStatus.values());
  }
  
  public async warmupModel(modelName: string): Promise<boolean> {
    const model = this.getModel(modelName);
    if (!model) return false;
    
    try {
      // Create a small tensor for warmup
      const inputShape = model.inputs[0].shape;
      const dummyTensor = tf.zeros(inputShape);
      
      // Do a prediction to warm up the model
      const result = await model.predict(dummyTensor);
      
      // Clean up tensors
      tf.dispose([dummyTensor, result]);
      return true;
    } catch (error) {
      console.error(`Error warming up model ${modelName}:`, error);
      return false;
    }
  }
}

export default ModelManager.getInstance();
