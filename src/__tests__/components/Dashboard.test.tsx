
import React from 'react';
import { screen } from '@testing-library/react';
import Dashboard from '@/components/Dashboard';
import { renderWithProviders, setupTest } from '@/utils/testHelpers';

// Mock the context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    loading: false
  })
}));

// Mock other dependencies
jest.mock('@/hooks/use-security-logs', () => ({
  useSecurityLogs: () => ({
    logs: [],
    loading: false,
    addLog: jest.fn()
  })
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    setupTest();
  });

  test('renders dashboard with main sections', () => {
    renderWithProviders(<Dashboard />);
    
    // Check if main dashboard elements are present
    expect(screen.getByText(/security status/i)).toBeInTheDocument();
    expect(screen.getByText(/quick actions/i)).toBeInTheDocument();
  });

  test('displays user-specific content when authenticated', () => {
    renderWithProviders(<Dashboard />);
    
    // Should show authenticated user content
    expect(screen.queryByText(/sign in/i)).not.toBeInTheDocument();
  });
});
