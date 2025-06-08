
import React from 'react';
import '@testing-library/jest-dom';
import Dashboard from '@/components/Dashboard';

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

// Basic test structure without testing library functions
describe('Dashboard Component', () => {
  test('dashboard exists', () => {
    expect(Dashboard).toBeDefined();
  });
});
