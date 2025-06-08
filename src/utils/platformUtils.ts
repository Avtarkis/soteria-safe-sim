

// Platform detection utilities for determining app environment

export type Platform = 'web' | 'ios' | 'android' | 'mobile' | 'store';

export interface PlatformInfo {
  isWeb: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  isStoreApp: boolean;
  platform: Platform;
}

export const isStoreApp = (): boolean => {
  // Check if we're in a browser environment first
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Check for environment variables safely
  try {
    // In Vite, environment variables are available on import.meta.env
    const buildTarget = import.meta.env.VITE_BUILD_TARGET;
    return buildTarget === 'store' || buildTarget === 'ios' || buildTarget === 'android';
  } catch (error) {
    console.warn('Could not access environment variables:', error);
    return false;
  }
};

export const getPlatform = (): 'web' | 'ios' | 'android' => {
  if (typeof window === 'undefined') {
    return 'web';
  }
  
  try {
    const buildTarget = import.meta.env.VITE_BUILD_TARGET;
    if (buildTarget === 'ios') return 'ios';
    if (buildTarget === 'android') return 'android';
    return 'web';
  } catch (error) {
    console.warn('Could not access environment variables:', error);
    return 'web';
  }
};

export const isWeb = (): boolean => {
  return getPlatform() === 'web' && !isStoreApp();
};

export const isWebPlatform = (): boolean => {
  return getPlatform() === 'web';
};

export const isMobile = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return window.navigator.userAgent.includes('Mobile') || 
         window.navigator.userAgent.includes('Android') ||
         window.navigator.userAgent.includes('iPhone');
};

export const isMobilePlatform = (): boolean => {
  const platform = getPlatform();
  return platform === 'ios' || platform === 'android';
};

export const isIOS = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return window.navigator.userAgent.includes('iPhone') || 
         window.navigator.userAgent.includes('iPad');
};

export const isAndroid = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return window.navigator.userAgent.includes('Android');
};

export const shouldShowSubscriptionPlans = (): boolean => {
  // Only show subscription plans on web platform to avoid app store fees
  return isWeb() && !isStoreApp();
};

export const shouldRedirectToSubscription = (): boolean => {
  // Redirect to subscription only on web after signup
  return isWeb() && !isStoreApp();
};

export const getAppStoreLink = (): string => {
  if (typeof window === 'undefined') {
    return '#';
  }
  
  const userAgent = window.navigator.userAgent;
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    return 'https://apps.apple.com/app/soteria-safety';
  } else if (userAgent.includes('Android')) {
    return 'https://play.google.com/store/apps/details?id=com.soteria.safety';
  }
  return '#'; // Fallback
};

export const usePlatform = (): PlatformInfo => {
  const isWebPlatform = isWeb();
  const isIOSPlatform = isIOS();
  const isAndroidPlatform = isAndroid();
  const isMobilePlatform = isMobile();
  const isStoreAppPlatform = isStoreApp();
  
  let platform: Platform = 'web';
  if (isStoreAppPlatform) platform = 'store';
  else if (isIOSPlatform) platform = 'ios';
  else if (isAndroidPlatform) platform = 'android';
  else if (isMobilePlatform) platform = 'mobile';
  
  return {
    isWeb: isWebPlatform,
    isIOS: isIOSPlatform,
    isAndroid: isAndroidPlatform,
    isMobile: isMobilePlatform,
    isStoreApp: isStoreAppPlatform,
    platform
  };
};

