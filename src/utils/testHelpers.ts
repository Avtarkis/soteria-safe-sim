
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import React from 'react';

// Mock user for testing
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com'
};

// Mock auth context for testing
export const mockAuthContext = {
  user: mockUser,
  loading: false,
  signIn: jest.fn().mockResolvedValue({ error: null }),
  signUp: jest.fn().mockResolvedValue({ error: null }),
  signOut: jest.fn().mockResolvedValue(undefined),
  resetPassword: jest.fn().mockResolvedValue({ error: null })
};

// Test wrapper component props interface
interface TestWrapperProps {
  children: React.ReactNode;
}

// Test wrapper component
export const TestWrapper: React.FC<TestWrapperProps> = ({ children }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
};

// Render component with test wrapper
export const renderWithProviders = (component: React.ReactElement) => {
  return render(component, { wrapper: TestWrapper });
};

// Mock emergency services
export const mockEmergencyServices = {
  startEmergencyCall: jest.fn(),
  sendEmergencyAlerts: jest.fn().mockResolvedValue(true),
  startRecording: jest.fn(),
  shareLocation: jest.fn()
};

// Mock AI services
export const mockAIServices = {
  startMonitoring: jest.fn().mockResolvedValue(true),
  stopMonitoring: jest.fn(),
  processVoiceCommand: jest.fn().mockResolvedValue({
    type: 'help',
    confidence: 0.9,
    originalText: 'test command',
    normalizedText: 'test command',
    urgency: 'medium'
  })
};

// Test data generators
export const generateMockThreat = (overrides: Record<string, any> = {}) => ({
  id: `threat-${Date.now()}`,
  type: 'security',
  severity: 'medium',
  description: 'Test threat',
  location: { lat: 40.7128, lng: -74.0060 },
  timestamp: Date.now(),
  ...overrides
});

export const generateMockAlert = (overrides: Record<string, any> = {}) => ({
  id: `alert-${Date.now()}`,
  title: 'Test Alert',
  description: 'This is a test alert',
  severity: 'medium' as const,
  category: 'security',
  status: 'active',
  created_at: new Date().toISOString(),
  ...overrides
});

// Common test utilities
export const waitForElement = async (selector: string) => {
  return await waitFor(() => screen.getByTestId(selector));
};

export const clickButton = async (buttonText: string) => {
  const button = screen.getByRole('button', { name: buttonText });
  fireEvent.click(button);
  return button;
};

export const fillInput = (labelText: string, value: string) => {
  const input = screen.getByLabelText(labelText);
  fireEvent.change(input, { target: { value } });
  return input;
};

// Mock localStorage for testing
export const mockLocalStorage = {
  getItem: jest.fn() as jest.Mock,
  setItem: jest.fn() as jest.Mock,
  removeItem: jest.fn() as jest.Mock,
  clear: jest.fn() as jest.Mock
};

// Setup function for tests
export const setupTest = () => {
  // Reset all mocks
  jest.clearAllMocks();
  
  // Mock console methods
  const consoleMock = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn()
  };
  
  Object.defineProperty(global, 'console', {
    value: consoleMock,
    writable: true
  });
  
  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  });
  
  // Mock geolocation
  const mockGeolocation = {
    getCurrentPosition: jest.fn().mockImplementation((success: PositionCallback) =>
      success({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 100,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: Date.now()
      } as GeolocationPosition)
    ),
    watchPosition: jest.fn(),
    clearWatch: jest.fn()
  };
  
  Object.defineProperty(navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true
  });
};
