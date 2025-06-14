import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import { TrainingData, ModelMetrics } from './weapon-detection-transfer-learning/types';
import { ModelUtils } from './weapon-detection-transfer-learning/ModelUtils';
import { DataPreparation } from './weapon-detection-transfer-learning/DataPreparation';

export class WeaponDetectionTransferLearning {
  private baseModel: tf.LayersModel | null = null;
  private transferModel: tf.LayersModel | null = null;
  private isTraining = false;
  private trainingHistory: ModelMetrics[] = [];
  
  constructor() {
    console.log('WeaponDetectionTransferLearning initialized');
  }

  public async loadPretrainedModel(): Promise<boolean> {
    try {
      console.log('Loading pre-trained YOLO model...');
      
      // Load a pre-trained COCO model that includes some weapon-like objects
      this.baseModel = await tf.loadLayersModel('/models/yolo-coco/model.json');
      
      console.log('Pre-trained model loaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to load pre-trained model:', error);
      
      // Fallback: Create a simple CNN architecture with standard input shape
      this.baseModel = ModelUtils.createFallbackModel([416, 416, 3]);
      return true;
    }
  }

  public async createTransferLearningModel(): Promise<boolean> {
    if (!this.baseModel) {
      throw new Error('Base model not loaded. Call loadPretrainedModel() first.');
    }
    try {
      this.transferModel = await ModelUtils.createTransferLearningModel(this.baseModel);
      console.log('Transfer learning model created successfully');
      return true;
    } catch (error) {
      console.error('Failed to create transfer learning model:', error);
      
      // Fallback: Create a simple model with standard input shape
      this.transferModel = ModelUtils.createFallbackModel([416, 416, 3]);
      return false;
    }
  }

  public async trainModel(
    trainingData: TrainingData[],
    validationData: TrainingData[],
    epochs: number = 50,
    batchSize: number = 16
  ): Promise<ModelMetrics[]> {
    if (!this.transferModel) {
      throw new Error('Transfer model not created. Call createTransferLearningModel() first.');
    }
    if (this.isTraining) {
      throw new Error('Training already in progress');
    }

    try {
      this.isTraining = true;
      console.log(`Starting training with ${trainingData.length} samples for ${epochs} epochs`);

      // Prepare training data tensors
      const { images, bboxes, classes } = DataPreparation.prepareTrainingData(trainingData);
      const { images: valImages, bboxes: valBboxes, classes: valClasses } = DataPreparation.prepareTrainingData(validationData);

      // Training configuration
      const history = await this.transferModel.fit(
        images,
        [bboxes, classes],
        {
          epochs,
          batchSize,
          validationData: [valImages, [valBboxes, valClasses]],
          callbacks: {
            onEpochEnd: (epoch, logs) => {
              const metrics: ModelMetrics = {
                accuracy: logs?.val_class_output_accuracy || logs?.val_accuracy || 0,
                precision: logs?.val_precision || 0,
                recall: logs?.val_recall || 0,
                f1Score: logs?.val_f1_score || 0,
                loss: logs?.val_loss || 0,
                epoch: epoch + 1
              };
              this.trainingHistory.push(metrics);
              console.log(`Epoch ${epoch + 1}/${epochs} - Loss: ${metrics.loss.toFixed(4)} - Accuracy: ${metrics.accuracy.toFixed(4)}`);
            }
          }
        }
      );

      // Clean up tensors
      images.dispose();
      bboxes.dispose();
      classes.dispose();
      valImages.dispose();
      valBboxes.dispose();
      valClasses.dispose();

      console.log('Training completed successfully');
      return this.trainingHistory;
    } catch (error) {
      console.error('Training failed:', error);
      throw error;
    } finally {
      this.isTraining = false;
    }
  }

  public async saveModel(modelName: string): Promise<boolean> {
    if (!this.transferModel) {
      console.error('No model to save');
      return false;
    }
    try {
      await this.transferModel.save(`indexeddb://${modelName}`);
      console.log(`Model saved as ${modelName}`);
      return true;
    } catch (error) {
      console.error('Failed to save model:', error);
      return false;
    }
  }

  public async loadModel(modelName: string): Promise<boolean> {
    try {
      this.transferModel = await tf.loadLayersModel(`indexeddb://${modelName}`);
      console.log(`Model ${modelName} loaded successfully`);
      return true;
    } catch (error) {
      console.error('Failed to load model:', error);
      return false;
    }
  }

  public getTrainingHistory(): ModelMetrics[] {
    return [...this.trainingHistory];
  }

  public isCurrentlyTraining(): boolean {
    return this.isTraining;
  }

  public async evaluateModel(testData: TrainingData[]): Promise<ModelMetrics> {
    if (!this.transferModel) {
      throw new Error('No model available for evaluation');
    }

    const { images, bboxes, classes } = DataPreparation.prepareTrainingData(testData);
    const evaluation = await this.transferModel.evaluate(
      images,
      [bboxes, classes]
    ) as tf.Tensor[];

    const loss = await evaluation[0].data();
    const accuracy = await evaluation[1].data(); // Assuming accuracy is at index 1

    // Clean up tensors
    images.dispose();
    bboxes.dispose();
    classes.dispose();
    evaluation.forEach(tensor => tensor.dispose());

    return {
      accuracy: accuracy[0],
      precision: 0, // Would need additional calculation
      recall: 0, // Would need additional calculation
      f1Score: 0, // Would need additional calculation
      loss: loss[0],
      epoch: 0
    };
  }
}

// Re-export types for backward compatibility
export type { TrainingData, ModelMetrics };
