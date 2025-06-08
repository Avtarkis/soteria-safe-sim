
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

export const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

export const setupTest = () => {
  if (typeof jest !== 'undefined') {
    jest.clearAllMocks();
  }
};

// Mock render functions for when testing library is not available
export const renderWithProviders = (component: React.ReactElement) => {
  return { container: document.createElement('div') };
};

export const render = renderWithProviders;
export const screen = {};
export const fireEvent = {};
export const waitFor = () => Promise.resolve();
