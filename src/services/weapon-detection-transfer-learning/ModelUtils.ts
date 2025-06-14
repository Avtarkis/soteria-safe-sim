import * as tf from '@tensorflow/tfjs';

export class ModelUtils {
  public static createFallbackModel(inputShape: [number, number, number]): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.conv2d({
          inputShape: inputShape,
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

  public static async createTransferLearningModel(baseModel: tf.LayersModel): Promise<tf.LayersModel> {
    // Freeze the base model layers (transfer learning)
    for (let i = 0; i < baseModel.layers.length - 3; i++) {
      baseModel.layers[i].trainable = false;
    }

    // Add custom classification head for weapon detection
    const input = tf.layers.input({ shape: [416, 416, 3] });
    // Use base model features
    let x = baseModel.apply(input) as tf.SymbolicTensor;

    // Add custom layers for weapon detection
    x = tf.layers.globalAveragePooling2d({}).apply(x) as tf.SymbolicTensor;
    x = tf.layers.dense({ units: 512, activation: 'relu' }).apply(x) as tf.SymbolicTensor;
    x = tf.layers.dropout({ rate: 0.5 }).apply(x) as tf.SymbolicTensor;
    x = tf.layers.dense({ units: 256, activation: 'relu' }).apply(x) as tf.SymbolicTensor;

    // Output layers for bounding box regression and classification
    const bbox_output = tf.layers.dense({ units: 4, activation: 'linear', name: 'bbox_output' }).apply(x) as tf.SymbolicTensor;
    const class_output = tf.layers.dense({ units: 4, activation: 'softmax', name: 'class_output' }).apply(x) as tf.SymbolicTensor;

    const transferModel = tf.model({ inputs: input, outputs: [bbox_output, class_output] });

    // Compile with multi-output loss
    transferModel.compile({
      optimizer: tf.train.adam(0.001),
      loss: {
        'bbox_output': 'meanSquaredError',
        'class_output': 'categoricalCrossentropy'
      },
      metrics: ['accuracy']
    });

    return transferModel;
  }
}
