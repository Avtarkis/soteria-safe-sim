
import * as tf from '@tensorflow/tfjs';
import { TrainingData } from './types';

export class DataPreparation {
  public static prepareTrainingData(trainingData: TrainingData[]) {
    const imageArray: number[][][][] = [];
    const bboxArray: number[][] = [];
    const classArray: number[][] = [];

    for (const data of trainingData) {
      // Convert tensor to array for processing
      const imageData = data.image.arraySync() as number[][][];
      imageArray.push(imageData);
      
      // Process annotations
      for (const annotation of data.annotations) {
        bboxArray.push(annotation.bbox);
        
        // Convert class to one-hot encoding
        const classOneHot = [0, 0, 0, 0];
        switch (annotation.class) {
          case 'weapon':
            classOneHot[0] = 1;
            break;
          case 'firearm':
            classOneHot[1] = 1;
            break;
          case 'knife':
            classOneHot[2] = 1;
            break;
          case 'blunt_object':
            classOneHot[3] = 1;
            break;
        }
        classArray.push(classOneHot);
      }
    }

    // Convert to tensors
    const images = tf.tensor4d(imageArray);
    const bboxes = tf.tensor2d(bboxArray);
    const classes = tf.tensor2d(classArray);

    return { images, bboxes, classes };
  }
}
