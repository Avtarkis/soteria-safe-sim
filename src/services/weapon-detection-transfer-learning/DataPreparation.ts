
import * as tf from '@tensorflow/tfjs';
import { TrainingData } from './types';

export class DataPreparation {
  public static prepareTrainingData(data: TrainingData[]) {
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

  private static getClassIndex(className: string): number {
    const classMap = { 'weapon': 0, 'firearm': 1, 'knife': 2, 'blunt_object': 3 };
    return classMap[className as keyof typeof classMap] || 0;
  }
}
