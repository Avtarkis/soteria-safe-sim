
/**
 * Platform utilities to determine platform and conditionally render features
 */

// Define the platforms we support
export type Platform = 'web' | 'android' | 'ios' | 'mobile' | 'store';

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

// Check if we're in a store-published app (App Store or Play Store)
export const isStoreApp = (): boolean => {
  // Additional check for store published apps
  // We would normally use the app's bundle ID or other store-specific indicators
  // For now, we'll use a simple check for a flag that would be set in the store version
  const isStoreBuild = window?.['IS_STORE_BUILD'] === true;
  return isMobile() && isStoreBuild;
};

// For testing, you can manually set this flag in development
export const setStoreAppForTesting = (value: boolean): void => {
  window['IS_STORE_BUILD'] = value;
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
    isStoreApp: boolean;
  }>({
    isWeb: true,
    isCapacitor: false,
    isIOS: false,
    isAndroid: false,
    isMobile: false,
    isStoreApp: false
  });

  useEffect(() => {
    // Do this check only once on component mount
    setPlatform({
      isWeb: isWeb(),
      isCapacitor: isCapacitor(),
      isIOS: isIOS(),
      isAndroid: isAndroid(),
      isMobile: isMobile(),
      isStoreApp: isStoreApp()
    });
  }, []);

  return platform;
};

// Helper function to check if the current platform is in the allowed platforms list
export const isPlatformAllowed = (platforms: Platform[]): boolean => {
  // Get the platform
  const isWebPlatform = isWeb();
  const isIOSPlatform = isIOS();
  const isAndroidPlatform = isAndroid();
  const isMobilePlatform = isMobile();
  const isStoreAppPlatform = isStoreApp();
  
  // Check if current platform is in the allowed platforms list
  return platforms.some(p => {
    if (p === 'web') return isWebPlatform;
    if (p === 'ios') return isIOSPlatform;
    if (p === 'android') return isAndroidPlatform; 
    if (p === 'mobile') return isMobilePlatform;
    if (p === 'store') return isStoreAppPlatform;
    return false;
  });
};

// Example usage: if(isPlatformAllowed(['web'])) { /* Web-only feature */ }
