
export const isStoreApp = (): boolean => {
  // Check if running in a mobile app context (Capacitor)
  return !!(window as any).Capacitor;
};

export const isWeb = (): boolean => {
  return !isStoreApp();
};

export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const getPlatform = (): 'web' | 'mobile-web' | 'ios' | 'android' => {
  if (isStoreApp()) {
    // If using Capacitor, check the platform
    const platform = (window as any).Capacitor?.getPlatform?.();
    return platform === 'ios' ? 'ios' : 'android';
  }
  
  return isMobile() ? 'mobile-web' : 'web';
};

export const getAppVersion = (): string => {
  // In a real app, this would come from your build process
  return '1.0.0';
};

export const isDebugMode = (): boolean => {
  return import.meta.env.DEV;
};
