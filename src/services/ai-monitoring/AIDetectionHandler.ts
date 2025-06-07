
import { AIThreatDetection } from '@/types/ai-monitoring';
import EmergencyResponseSystem from '@/utils/emergency/EmergencyResponseSystem';

export class AIDetectionHandler {
  public mapDetectionType(detectionType: string): 'health' | 'security' | 'environment' {
    if (detectionType === 'fall' || detectionType === 'medical') {
      return 'health';
    } else if (detectionType === 'weapon' || detectionType === 'struggle') {
      return 'security';
    } else {
      return 'environment';
    }
  }

  public mapSeverityLevel(confidence: number): 'low' | 'medium' | 'high' | 'critical' {
    if (confidence >= 0.9) return 'critical';
    if (confidence >= 0.75) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  }

  public getRecommendedAction(detectionType: string): string {
    switch (detectionType) {
      case 'weapon':
        return 'Immediately contact emergency services and move to safety';
      case 'fall':
        return 'Check for injuries and call medical assistance if needed';
      case 'struggle':
        return 'Assess situation and contact appropriate authorities';
      default:
        return 'Monitor situation and take appropriate precautions';
    }
  }

  public handleAutomaticResponse(detection: AIThreatDetection, autoResponseLevel: string): void {
    if (autoResponseLevel === 'none') return;

    if (detection.type && detection.confidence) {
      const validSubtypes: ('fall' | 'weapon' | 'struggle' | 'unknown')[] = ['fall', 'weapon', 'struggle', 'unknown'];
      const mappedSubtype = validSubtypes.includes(detection.subtype as any) 
        ? detection.subtype as 'fall' | 'weapon' | 'struggle' | 'unknown'
        : 'unknown';

      EmergencyResponseSystem.handleThreatDetection({
        type: mappedSubtype,
        confidence: detection.confidence,
        details: detection.description || detection.details || 'AI threat detected'
      });
    }

    if (autoResponseLevel === 'full' && (detection.severity === 'high' || detection.severity === 'critical')) {
      detection.automaticResponseTaken = 'Emergency protocols activated automatically';
    } else if (autoResponseLevel === 'assist') {
      detection.automaticResponseTaken = 'User notified, manual action required';
    } else {
      detection.automaticResponseTaken = 'Detection logged, no automatic action taken';
    }
  }
}
