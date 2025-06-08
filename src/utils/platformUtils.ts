
// Platform detection utilities for determining app environment

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

export const isWebPlatform = (): boolean => {
  return getPlatform() === 'web';
};

export const isMobilePlatform = (): boolean => {
  const platform = getPlatform();
  return platform === 'ios' || platform === 'android';
};
