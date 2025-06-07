
import { WeaponDetectionCore, WeaponDetectionResult } from './WeaponDetectionCore';
import * as tf from '@tensorflow/tfjs';

export class VideoProcessor {
  private core: WeaponDetectionCore;
  private videoElement: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private isProcessing = false;
  private detectionInterval: NodeJS.Timeout | null = null;
  private callbacks: Array<(result: WeaponDetectionResult) => void> = [];

  constructor(core: WeaponDetectionCore) {
    this.core = core;
  }

  public async startProcessing(videoElement: HTMLVideoElement): Promise<boolean> {
    if (!this.core.isActive()) {
      console.error('Core not initialized');
      return false;
    }

    this.videoElement = videoElement;
    this.setupCanvas();

    if (!this.context) {
      console.error('Failed to get canvas context');
      return false;
    }

    this.isProcessing = true;
    this.startContinuousDetection();
    return true;
  }

  public stopProcessing(): void {
    this.isProcessing = false;
    
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
  }

  private setupCanvas(): void {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 416;
    this.canvas.height = 416;
    this.context = this.canvas.getContext('2d');
  }

  private startContinuousDetection(): void {
    const config = this.core.getConfig();
    
    this.detectionInterval = setInterval(async () => {
      if (this.isProcessing && this.videoElement && this.context) {
        try {
          const result = await this.processFrame();
          if (result.weaponDetected) {
            this.notifyCallbacks(result);
          }
        } catch (error) {
          console.error('Frame processing error:', error);
        }
      }
    }, config.detectionInterval);
  }

  private async processFrame(): Promise<WeaponDetectionResult> {
    if (!this.videoElement || !this.context || !this.canvas) {
      throw new Error('Processing components not ready');
    }

    this.context.drawImage(this.videoElement, 0, 0, 416, 416);
    
    const imageTensor = tf.browser.fromPixels(this.canvas)
      .expandDims(0)
      .div(255.0);

    const result = await this.core.detectWeapons(imageTensor);
    imageTensor.dispose();

    return result;
  }

  public addCallback(callback: (result: WeaponDetectionResult) => void): void {
    this.callbacks.push(callback);
  }

  public removeCallback(callback: (result: WeaponDetectionResult) => void): void {
    const index = this.callbacks.indexOf(callback);
    if (index !== -1) {
      this.callbacks.splice(index, 1);
    }
  }

  private notifyCallbacks(result: WeaponDetectionResult): void {
    this.callbacks.forEach(callback => {
      try {
        callback(result);
      } catch (error) {
        console.error('Error in detection callback:', error);
      }
    });
  }

  public isActive(): boolean {
    return this.isProcessing;
  }
}
