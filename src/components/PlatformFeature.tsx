
import React from 'react';
import { Platform, usePlatform } from '@/utils/platformUtils';

interface PlatformFeatureProps {
  /**
   * The platforms this feature should be available on
   */
  platforms: Platform[];
  
  /**
   * The feature/component to render if platform matches
   */
  children: React.ReactNode;
  
  /**
   * Optional fallback component to render if platform doesn't match
   */
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders content based on the platform (web/mobile)
 * 
 * @example
 * // Show a feature only on web
 * <PlatformFeature platforms={['web']}>
 *   <WebOnlyFeature />
 * </PlatformFeature>
 * 
 * @example
 * // Show different UIs on web vs mobile
 * <PlatformFeature 
 *   platforms={['web']} 
 *   fallback={<MobileUI />}
 * >
 *   <WebUI />
 * </PlatformFeature>
 */
export const PlatformFeature: React.FC<PlatformFeatureProps> = ({
  platforms,
  children,
  fallback
}) => {
  const { isWeb, isIOS, isAndroid, isMobile } = usePlatform();
  
  // Check if current platform is in the allowed platforms list
  const shouldRender = platforms.some(p => {
    if (p === 'web') return isWeb;
    if (p === 'ios') return isIOS;
    if (p === 'android') return isAndroid; 
    if (p === 'mobile') return isMobile;
    return false;
  });
  
  if (shouldRender) {
    return <>{children}</>;
  }
  
  // Return fallback if provided, otherwise null
  return fallback ? <>{fallback}</> : null;
};

export default PlatformFeature;
