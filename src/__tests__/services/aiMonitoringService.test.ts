
import { aiMonitoringService } from '@/services/aiMonitoringService';
import { setupTest } from '@/utils/testHelpers';

// Mock dependencies
jest.mock('@/services/ThreatDetectionService');
jest.mock('@/utils/emergency/EmergencyResponseSystem');

describe('AIMonitoringService', () => {
  beforeEach(() => {
    setupTest();
    aiMonitoringService.stopMonitoring();
  });

  test('initializes with default settings', () => {
    const settings = aiMonitoringService.getSettings();
    
    expect(settings.enabled).toBe(false);
    expect(settings.healthMonitoring).toBe(true);
    expect(settings.environmentalMonitoring).toBe(true);
    expect(settings.securityMonitoring).toBe(true);
  });

  test('saves and loads settings correctly', () => {
    const newSettings = {
      enabled: true,
      healthMonitoring: false,
      environmentalMonitoring: true,
      securityMonitoring: true,
      autoResponseLevel: 'full' as const,
      emergencyContactsToNotify: ['test@example.com']
    };

    aiMonitoringService.saveSettings(newSettings);
    const savedSettings = aiMonitoringService.getSettings();
    
    expect(savedSettings.enabled).toBe(true);
    expect(savedSettings.healthMonitoring).toBe(false);
    expect(savedSettings.autoResponseLevel).toBe('full');
  });

  test('tracks detection history', () => {
    const initialHistory = aiMonitoringService.getDetectionHistory();
    expect(initialHistory).toHaveLength(0);
  });

  test('provides event listener functionality', () => {
    const mockListener = jest.fn();
    const unsubscribe = aiMonitoringService.addEventListener(mockListener);
    
    expect(typeof unsubscribe).toBe('function');
    
    // Clean up
    unsubscribe();
  });
});
