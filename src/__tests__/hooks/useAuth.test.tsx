
import React from 'react';
import { renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAuth } from '@/contexts/AuthContext';
import { TestWrapper, setupTest } from '@/utils/testHelpers';

describe('useAuth Hook', () => {
  beforeEach(() => {
    setupTest();
  });

  test('provides authentication context', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper
    });

    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('signIn');
    expect(result.current).toHaveProperty('signUp');
    expect(result.current).toHaveProperty('signOut');
    expect(result.current).toHaveProperty('resetPassword');
  });

  test('authentication methods are functions', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper
    });

    expect(typeof result.current.signIn).toBe('function');
    expect(typeof result.current.signUp).toBe('function');
    expect(typeof result.current.signOut).toBe('function');
    expect(typeof result.current.resetPassword).toBe('function');
  });
});
