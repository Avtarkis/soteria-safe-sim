
/**
 * Platform utilities to determine platform and conditionally render features
 */

// Define the platforms we support
export type Platform = 'web' | 'android' | 'ios' | 'mobile';

// Check if we're running in Capacitor (mobile)
export const isCapacitor = (): boolean => {
  return window?.['Capacitor'] !== undefined;
};

// Check if we're on iOS
export const isIOS = (): boolean => {
  if (!isCapacitor()) return false;
  return window?.['Capacitor']?.['platform'] === 'ios';
};

// Check if we're on Android
export const isAndroid = (): boolean => {
  if (!isCapacitor()) return false;
  return window?.['Capacitor']?.['platform'] === 'android';
};

// Check if we're on any mobile platform
export const isMobile = (): boolean => {
  return isIOS() || isAndroid();
};

// Check if we're on web
export const isWeb = (): boolean => {
  return !isMobile();
};

// Hook to use platform detection in components
import { useState, useEffect } from 'react';

export const usePlatform = () => {
  const [platform, setPlatform] = useState<{
    isWeb: boolean;
    isCapacitor: boolean;
    isIOS: boolean;
    isAndroid: boolean;
    isMobile: boolean;
  }>({
    isWeb: true,
    isCapacitor: false,
    isIOS: false,
    isAndroid: false,
    isMobile: false
  });

  useEffect(() => {
    // Do this check only once on component mount
    setPlatform({
      isWeb: isWeb(),
      isCapacitor: isCapacitor(),
      isIOS: isIOS(),
      isAndroid: isAndroid(),
      isMobile: isMobile()
    });
  }, []);

  return platform;
};

// Helper to conditionally render components based on platform
export const PlatformComponent = ({ 
  platforms,
  children 
}: { 
  platforms: Platform[]; 
  children: React.ReactNode;
}) => {
  const platform = usePlatform();
  
  // Check if current platform is in the allowed platforms list
  const shouldRender = platforms.some(p => {
    if (p === 'web') return platform.isWeb;
    if (p === 'ios') return platform.isIOS;
    if (p === 'android') return platform.isAndroid; 
    if (p === 'mobile') return platform.isMobile;
    return false;
  });
  
  return shouldRender ? <>{children}</> : null;
};

// Example usage: <PlatformComponent platforms={['web']}>Web-only feature</PlatformComponent>
