
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

export const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

export const renderWithProviders = (component: React.ReactElement) => {
  return render(component, { wrapper: TestWrapper });
};

export const setupTest = () => {
  if (typeof jest !== 'undefined') {
    jest.clearAllMocks();
  }
};

export { render, screen, fireEvent, waitFor } from '@testing-library/react';
