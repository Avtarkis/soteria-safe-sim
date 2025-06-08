
// Platform detection utilities

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
  // Check if running as a store app (iOS App Store or Google Play)
  return (
    window.location.hostname === 'localhost' && 
    (window.navigator.userAgent.includes('Mobile') || window.navigator.userAgent.includes('Android'))
  ) || 
  // Check for Capacitor native context
  !!(window as any).Capacitor ||
  // Check for store app environment variables
  import.meta.env.VITE_STORE_APP === 'true';
};

export const isWeb = (): boolean => {
  return !isStoreApp() && window.location.hostname !== 'localhost';
};

export const isMobile = (): boolean => {
  return window.navigator.userAgent.includes('Mobile') || 
         window.navigator.userAgent.includes('Android') ||
         window.navigator.userAgent.includes('iPhone');
};

export const isIOS = (): boolean => {
  return window.navigator.userAgent.includes('iPhone') || 
         window.navigator.userAgent.includes('iPad');
};

export const isAndroid = (): boolean => {
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
  const userAgent = window.navigator.userAgent;
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    return 'https://apps.apple.com/app/soteria-safety';
  } else if (userAgent.includes('Android')) {
    return 'https://play.google.com/store/apps/details?id=com.soteria.safety';
  }
  return '#'; // Fallback
};

export const getPlatform = (): PlatformInfo => {
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

export const usePlatform = (): PlatformInfo => {
  return getPlatform();
};
