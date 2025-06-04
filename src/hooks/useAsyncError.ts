
import { useCallback } from 'react';
import { useErrorBoundary } from './useErrorBoundary';

export const useAsyncError = () => {
  const { captureError } = useErrorBoundary();

  const throwError = useCallback((error: Error) => {
    captureError(error);
  }, [captureError]);

  return throwError;
};
