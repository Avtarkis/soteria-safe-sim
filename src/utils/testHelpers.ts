
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import React from 'react';

export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com'
};

export const mockAuthContext = {
  user: mockUser,
  loading: false,
  signIn: jest.fn().mockResolvedValue({ error: null }),
  signUp: jest.fn().mockResolvedValue({ error: null }),
  signOut: jest.fn().mockResolvedValue(undefined),
  resetPassword: jest.fn().mockResolvedValue({ error: null })
};

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

export const renderWithProviders = (component: React.ReactElement) => {
  return render(component, { wrapper: TestWrapper });
};

export const setupTest = () => {
  jest.clearAllMocks();
  
  const consoleMock = {
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  };
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.console = consoleMock as any;
  
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

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })) as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })) as any;
};

export { render, screen, fireEvent, waitFor };
