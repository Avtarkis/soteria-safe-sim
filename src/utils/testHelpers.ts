
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import React from 'react';

// Mock user data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com'
};

// Mock auth context
export const mockAuthContext = {
  user: mockUser,
  loading: false,
  signIn: jest.fn().mockResolvedValue({ error: null }),
  signUp: jest.fn().mockResolvedValue({ error: null }),
  signOut: jest.fn().mockResolvedValue(undefined),
  resetPassword: jest.fn().mockResolvedValue({ error: null })
};

// Test wrapper component
interface TestWrapperProps {
  children: React.ReactNode;
}

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

// Render with providers utility
export const renderWithProviders = (component: React.ReactElement) => {
  return render(component, { wrapper: TestWrapper });
};

// Setup test environment
export const setupTest = () => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Setup console mock
  const consoleMock = {
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  };
  
  Object.defineProperty(global, 'console', {
    value: consoleMock,
    writable: true
  });
  
  // Setup localStorage mock
  const mockLocalStorage = {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  };
  
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  });
  
  // Setup geolocation mock
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

  // Setup matchMedia mock
  const matchMediaMock = jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: matchMediaMock,
  });

  // Setup ResizeObserver mock
  const ResizeObserverMock = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  Object.defineProperty(global, 'ResizeObserver', {
    value: ResizeObserverMock,
    writable: true
  });

  // Setup IntersectionObserver mock
  const IntersectionObserverMock = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  Object.defineProperty(global, 'IntersectionObserver', {
    value: IntersectionObserverMock,
    writable: true
  });
};

// Re-export testing utilities
export { render, screen, fireEvent, waitFor };
