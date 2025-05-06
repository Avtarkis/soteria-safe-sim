
// Mock implementation of ModelManager that doesn't require TensorFlow
export interface ModelStatus {
  loaded: boolean;
  name: string;
  type: 'pose' | 'audio' | 'activity';
  version?: string;
  error?: string;
}

export class ModelManager {
  private static instance: ModelManager;
  private models: Map<string, any> = new Map();
  private modelStatus: Map<string, ModelStatus> = new Map();
  
  private constructor() {
    // Initialize
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
      console.log('TensorFlow.js initialization skipped in development mode');
    } catch (e) {
      console.warn('TensorFlow.js initialization failed:', e);
    }
    
    console.log('Mock TensorFlow.js is ready');
  }
  
  public async loadModel(
    modelType: 'pose' | 'audio' | 'activity',
    modelName: string,
    modelUrl: string
  ): Promise<any> {
    try {
      console.log(`Loading ${modelType} model: ${modelName} (mock)`);
      
      this.modelStatus.set(modelName, {
        loaded: false,
        name: modelName,
        type: modelType,
      });
      
      // Create a mock model
      const mockModel = {
        name: modelName,
        type: modelType,
        url: modelUrl,
        predict: async (input: any) => {
          console.log(`Mock prediction with ${modelName}`);
          return {
            data: async () => new Float32Array(10).fill(0.1)
          };
        }
      };
      
      this.models.set(modelName, mockModel);
      this.modelStatus.set(modelName, {
        loaded: true,
        name: modelName,
        type: modelType,
        version: '1.0 (mock)'
      });
      
      console.log(`Successfully loaded ${modelType} model: ${modelName} (mock)`);
      return mockModel;
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
  
  public getModel(modelName: string): any | null {
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
      // Mock warmup
      await model.predict(null);
      return true;
    } catch (error) {
      console.error(`Error warming up model ${modelName}:`, error);
      return false;
    }
  }
}

// Create and export singleton instance
const instance = ModelManager.getInstance();
export default instance;
