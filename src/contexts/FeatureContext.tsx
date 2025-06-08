import React, { createContext, useContext, useState, useEffect } from 'react';
import useSubscriptionStatus, { SubscriptionTier } from '@/hooks/useSubscriptionStatus';

// Define feature flags based on subscription tier
export interface Features {
  // Individual plan features
  threatDetection: boolean;
  globalAlerts: boolean;
  emergencyContact: boolean;
  travelAdvisories: boolean;
  basicFamilySharing: boolean;
  
  // Family plan features
  familySharing: boolean;
  safetyCheckIns: boolean;
  emergencyBroadcasts: boolean;
  safetyZones: boolean;
  sharedEmergencyContacts: boolean;
  
  // Additional premium features
  aiMonitoring: boolean;
  prioritySupport: boolean;
}

interface FeatureContextType {
  features: Features;
  hasActiveSubscription: boolean;
  subscriptionTier: SubscriptionTier;
  isLoading: boolean;
}

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

export const useFeatures = () => {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeatures must be used within a FeatureProvider');
  }
  return context;
};

export const FeatureProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { hasActiveSubscription, subscriptionTier, isLoading } = useSubscriptionStatus();
  const [features, setFeatures] = useState<Features>({
    // Default to all features disabled
    threatDetection: false,
    globalAlerts: false,
    emergencyContact: false,
    travelAdvisories: false,
    basicFamilySharing: false,
    familySharing: false,
    safetyCheckIns: false,
    emergencyBroadcasts: false,
    safetyZones: false,
    sharedEmergencyContacts: false,
    aiMonitoring: false,
    prioritySupport: false,
  });

  // Update features based on subscription tier
  useEffect(() => {
    if (isLoading) return;

    if (hasActiveSubscription) {
      if (subscriptionTier === 'individual') {
        setFeatures({
          // Individual plan features
          threatDetection: true,
          globalAlerts: true,
          emergencyContact: true,
          travelAdvisories: true,
          basicFamilySharing: true,
          
          // Family plan features - not available
          familySharing: false,
          safetyCheckIns: false,
          emergencyBroadcasts: false,
          safetyZones: false,
          sharedEmergencyContacts: false,
          
          // Premium features
          aiMonitoring: true,
          prioritySupport: false,
        });
      } else if (subscriptionTier === 'family') {
        setFeatures({
          // Individual plan features
          threatDetection: true,
          globalAlerts: true,
          emergencyContact: true,
          travelAdvisories: true,
          basicFamilySharing: true,
          
          // Family plan features
          familySharing: true,
          safetyCheckIns: true,
          emergencyBroadcasts: true,
          safetyZones: true,
          sharedEmergencyContacts: true,
          
          // Premium features
          aiMonitoring: true,
          prioritySupport: true,
        });
      }
    } else {
      // If no subscription, reset all features to disabled
      setFeatures({
        threatDetection: false,
        globalAlerts: false,
        emergencyContact: false,
        travelAdvisories: false,
        basicFamilySharing: false,
        familySharing: false,
        safetyCheckIns: false,
        emergencyBroadcasts: false,
        safetyZones: false,
        sharedEmergencyContacts: false,
        aiMonitoring: false,
        prioritySupport: false,
      });
    }
  }, [hasActiveSubscription, subscriptionTier, isLoading]);

  return (
    <FeatureContext.Provider value={{ features, hasActiveSubscription, subscriptionTier, isLoading }}>
      {children}
    </FeatureContext.Provider>
  );
};

export default FeatureProvider;
