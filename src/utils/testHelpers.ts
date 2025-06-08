
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Minimal test wrapper
export const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

// Simple render utility
export const renderWithProviders = (component: React.ReactElement) => {
  return render(component, { wrapper: TestWrapper });
};

// Basic test setup
export const setupTest = () => {
  jest.clearAllMocks();
};

// Re-export essentials
export { render, screen, fireEvent, waitFor } from '@testing-library/react';
