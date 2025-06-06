
// Platform detection utilities
export const isStoreApp = (): boolean => {
  // Check if running as a store app (iOS App Store or Google Play)
  return (
    window.location.hostname === 'localhost' && 
    (window.navigator.userAgent.includes('Mobile') || window.navigator.userAgent.includes('Android'))
  ) || 
  // Check for Capacitor native context
  !!(window as any).Capacitor ||
  // Check for store app environment variables
  process.env.STORE_APP === 'true';
};

export const isWeb = (): boolean => {
  return !isStoreApp() && window.location.hostname !== 'localhost';
};

export const isMobile = (): boolean => {
  return window.navigator.userAgent.includes('Mobile') || 
         window.navigator.userAgent.includes('Android') ||
         window.navigator.userAgent.includes('iPhone');
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
