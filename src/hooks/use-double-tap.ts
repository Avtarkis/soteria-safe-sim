
import { useEffect, useState, useRef, useCallback } from 'react';

interface UseTapDetectorOptions {
  threshold?: number; // Time in ms between taps
  onDoubleTap?: () => void;
}

export function useDoubleTap({
  threshold = 300,
  onDoubleTap
}: UseTapDetectorOptions = {}) {
  const [lastTap, setLastTap] = useState<number>(0);
  const timerRef = useRef<number | null>(null);
  
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  
  const handleTap = useCallback(() => {
    const now = Date.now();
    const timeDiff = now - lastTap;
    
    if (lastTap && timeDiff < threshold) {
      // It's a double tap
      if (onDoubleTap) onDoubleTap();
      setLastTap(0);
      clearTimer();
    } else {
      // It's a single tap, wait for a possible second tap
      setLastTap(now);
      clearTimer();
      
      // Reset after threshold time
      timerRef.current = window.setTimeout(() => {
        setLastTap(0);
      }, threshold);
    }
  }, [lastTap, threshold, onDoubleTap, clearTimer]);
  
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);
  
  return {
    handleTap
  };
}

// Hook to detect volume button taps
export function useVolumeButtonDoubleTap(onDoubleTap: () => void) {
  useEffect(() => {
    let lastVolumeButtonPress = 0;
    const threshold = 300; // ms
    
    const handleVolumeButtonPress = (event: KeyboardEvent) => {
      // Listen for volume buttons
      if (event.key === 'AudioVolumeUp' || event.key === 'AudioVolumeDown') {
        const now = Date.now();
        if (now - lastVolumeButtonPress < threshold) {
          onDoubleTap();
          lastVolumeButtonPress = 0;
        } else {
          lastVolumeButtonPress = now;
        }
      }
    };
    
    window.addEventListener('keydown', handleVolumeButtonPress);
    
    return () => {
      window.removeEventListener('keydown', handleVolumeButtonPress);
    };
  }, [onDoubleTap]);

  // Nothing to return as this is just a detector
  return null;
}
