
import { WeaponDetectionCore, WeaponDetectionResult, WeaponDetectionConfig } from './weapon-detection/WeaponDetectionCore';
import { VideoProcessor } from './weapon-detection/VideoProcessor';

export class ProductionWeaponDetectionService {
  private core: WeaponDetectionCore;
  private processor: VideoProcessor;

  constructor() {
    const config: WeaponDetectionConfig = {
      confidenceThreshold: 0.7,
      modelEndpoint: '/models/weapon-detection/model.json',
      enableContinuousDetection: true,
      detectionInterval: 1000,
      enableCloudAnalysis: false
    };

    this.core = new WeaponDetectionCore(config);
    this.processor = new VideoProcessor(this.core);
  }

  public async initialize(): Promise<boolean> {
    return await this.core.initialize();
  }

  public async startDetection(videoElement: HTMLVideoElement): Promise<boolean> {
    return await this.processor.startProcessing(videoElement);
  }

  public stopDetection(): void {
    this.processor.stopProcessing();
  }

  public addDetectionCallback(callback: (result: WeaponDetectionResult) => void): void {
    this.processor.addCallback(callback);
  }

  public removeDetectionCallback(callback: (result: WeaponDetectionResult) => void): void {
    this.processor.removeCallback(callback);
  }

  public updateConfig(newConfig: Partial<WeaponDetectionConfig>): void {
    this.core.updateConfig(newConfig);
  }

  public async captureAndAnalyze(): Promise<WeaponDetectionResult> {
    // This would need to be implemented in the processor
    throw new Error('Not implemented yet');
  }

  public isActive(): boolean {
    return this.processor.isActive();
  }

  public getConfig(): WeaponDetectionConfig {
    return this.core.getConfig();
  }
}

export const productionWeaponDetectionService = new ProductionWeaponDetectionService();
export default productionWeaponDetectionService;
