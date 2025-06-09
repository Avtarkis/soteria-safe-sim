
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
