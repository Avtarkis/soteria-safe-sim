
import React, { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
}

export const useErrorBoundary = () => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  const captureError = useCallback((error: Error, errorInfo?: { componentStack?: string }) => {
    const errorData: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: Date.now()
    };

    setErrors(prev => [...prev, errorData]);

    // Show user-friendly error message
    toast({
      title: "An error occurred",
      description: "We've logged the issue and are working to fix it.",
      variant: "destructive",
    });

    // Log to console for debugging
    console.error('Error captured:', errorData);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    errors,
    captureError,
    clearErrors,
    hasErrors: errors.length > 0
  };
};
