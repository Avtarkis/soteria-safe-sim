import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

export interface TrainingData {
  image: tf.Tensor;
  annotations: {
    bbox: [number, number, number, number]; // [x, y, width, height]
    class: 'weapon' | 'firearm' | 'knife' | 'blunt_object';
    confidence: number;
  }[];
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  loss: number;
  epoch: number;
}

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
      
      // Fallback: Create a simple CNN architecture
      this.baseModel = this.createFallbackModel();
      return true;
    }
  }

  private createFallbackModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.conv2d({
          inputShape: [416, 416, 3],
          filters: 32,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu', padding: 'same' }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.conv2d({ filters: 128, kernelSize: 3, activation: 'relu', padding: 'same' }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.flatten(),
        tf.layers.dense({ units: 512, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({ units: 256, activation: 'relu' }),
        tf.layers.dense({ units: 4, activation: 'softmax' }) // 4 weapon classes
      ]
    });

    return model;
  }

  public async createTransferLearningModel(): Promise<boolean> {
    if (!this.baseModel) {
      throw new Error('Base model not loaded. Call loadPretrainedModel() first.');
    }

    try {
      // Freeze the base model layers (transfer learning)
      for (let i = 0; i < this.baseModel.layers.length - 3; i++) {
        this.baseModel.layers[i].trainable = false;
      }

      // Add custom classification head for weapon detection
      const input = tf.layers.input({ shape: [416, 416, 3] });
      
      // Use base model features
      let x = this.baseModel.apply(input) as tf.SymbolicTensor;
      
      // Add custom layers for weapon detection
      x = tf.layers.globalAveragePooling2d().apply(x) as tf.SymbolicTensor;
      x = tf.layers.dense({ units: 512, activation: 'relu' }).apply(x) as tf.SymbolicTensor;
      x = tf.layers.dropout({ rate: 0.5 }).apply(x) as tf.SymbolicTensor;
      x = tf.layers.dense({ units: 256, activation: 'relu' }).apply(x) as tf.SymbolicTensor;
      
      // Output layers for bounding box regression and classification
      const bbox_output = tf.layers.dense({ 
        units: 4, 
        activation: 'linear',
        name: 'bbox_output'
      }).apply(x) as tf.SymbolicTensor;
      
      const class_output = tf.layers.dense({ 
        units: 4, 
        activation: 'softmax',
        name: 'class_output'
      }).apply(x) as tf.SymbolicTensor;

      this.transferModel = tf.model({
        inputs: input,
        outputs: [bbox_output, class_output]
      });

      // Compile with multi-output loss
      this.transferModel.compile({
        optimizer: tf.train.adam(0.001),
        loss: {
          'bbox_output': 'meanSquaredError',
          'class_output': 'categoricalCrossentropy'
        },
        metrics: ['accuracy']
      });

      console.log('Transfer learning model created successfully');
      return true;
    } catch (error) {
      console.error('Failed to create transfer learning model:', error);
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
      const { images, bboxes, classes } = this.prepareTrainingData(trainingData);
      const { images: valImages, bboxes: valBboxes, classes: valClasses } = this.prepareTrainingData(validationData);

      // Training configuration
      const history = await this.transferModel.fit(
        images,
        [bboxes, classes], // Fixed: use array instead of object
        {
          epochs,
          batchSize,
          validationData: [valImages, [valBboxes, valClasses]], // Fixed: use array instead of object
          callbacks: {
            onEpochEnd: (epoch, logs) => {
              const metrics: ModelMetrics = {
                accuracy: logs?.val_accuracy || 0,
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

  private prepareTrainingData(data: TrainingData[]) {
    const imageArray: number[][][][] = [];
    const bboxArray: number[][] = [];
    const classArray: number[][] = [];

    data.forEach(sample => {
      // Convert tensor to array (assuming normalized)
      const imageData = sample.image.arraySync() as number[][][];
      imageArray.push(imageData);

      // Use first annotation (could be extended for multiple objects)
      const annotation = sample.annotations[0];
      bboxArray.push(annotation.bbox);
      
      // One-hot encode class
      const classOneHot = [0, 0, 0, 0];
      const classIndex = this.getClassIndex(annotation.class);
      classOneHot[classIndex] = 1;
      classArray.push(classOneHot);
    });

    return {
      images: tf.tensor4d(imageArray),
      bboxes: tf.tensor2d(bboxArray),
      classes: tf.tensor2d(classArray)
    };
  }

  private getClassIndex(className: string): number {
    const classMap = {
      'weapon': 0,
      'firearm': 1,
      'knife': 2,
      'blunt_object': 3
    };
    return classMap[className as keyof typeof classMap] || 0;
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

    const { images, bboxes, classes } = this.prepareTrainingData(testData);
    
    const evaluation = await this.transferModel.evaluate(
      images,
      [bboxes, classes] // Fixed: use array instead of object
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

export const weaponDetectionTransferLearning = new WeaponDetectionTransferLearning();
export default weaponDetectionTransferLearning;
