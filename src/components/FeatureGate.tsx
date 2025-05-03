
import React from 'react';
import { useFeatures } from '@/contexts/FeatureContext';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { isStoreApp, isWeb } from '@/utils/platformUtils';

interface FeatureGateProps {
  /**
   * The feature key to check from the Features interface
   */
  feature: keyof ReturnType<typeof useFeatures>['features'];
  
  /**
   * The content to render if the feature is available
   */
  children: React.ReactNode;
  
  /**
   * Optional fallback component to render if feature isn't available
   */
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders content based on subscription features
 */
export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback
}) => {
  const { features, hasActiveSubscription } = useFeatures();
  
  // Check if the feature is enabled
  const isFeatureEnabled = features[feature];
  
  if (isFeatureEnabled) {
    return <>{children}</>;
  }
  
  // If no custom fallback is provided, show a default locked feature UI
  if (!fallback) {
    return (
      <Card className="relative overflow-hidden h-full border-dashed border-gray-300 bg-gray-50 dark:bg-gray-800/30 dark:border-gray-700">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-gray-500 dark:text-gray-400">
          <Lock className="h-10 w-10 mb-2 opacity-50" />
          <h3 className="text-lg font-medium">Premium Feature</h3>
          <p className="mt-1 text-sm max-w-xs">
            This feature requires an active subscription
          </p>
          {!hasActiveSubscription && isWeb() && !isStoreApp() && (
            <Link 
              to="/subscription" 
              className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              Subscribe now
            </Link>
          )}
        </div>
      </Card>
    );
  }
  
  // Return custom fallback
  return <>{fallback}</>;
};

export default FeatureGate;
