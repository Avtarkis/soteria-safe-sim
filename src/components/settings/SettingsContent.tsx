
import React from 'react';
import AccountSettings from '@/components/settings/AccountSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import PrivacySecuritySettings from '@/components/settings/PrivacySecuritySettings';
import RegionalSettings from '@/components/settings/RegionalSettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import AdvancedSettings from '@/components/settings/AdvancedSettings';

interface SettingsContentProps {
  notifications: {
    email: boolean;
    push: boolean;
    emergencyAlerts: boolean;
    securityAlerts: boolean;
    travelAlerts: boolean;
  };
  setNotifications: React.Dispatch<React.SetStateAction<{
    email: boolean;
    push: boolean;
    emergencyAlerts: boolean;
    securityAlerts: boolean;
    travelAlerts: boolean;
  }>>;
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  language: string;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  units: string;
  setUnits: React.Dispatch<React.SetStateAction<string>>;
}

const SettingsContent = ({
  notifications,
  setNotifications,
  darkMode,
  setDarkMode,
  language,
  setLanguage,
  units,
  setUnits
}: SettingsContentProps) => {
  return (
    <div className="space-y-6">
      <AccountSettings />
      
      <NotificationSettings 
        notifications={notifications}
        setNotifications={setNotifications}
      />
      
      <PrivacySecuritySettings />
      
      <RegionalSettings 
        language={language}
        setLanguage={setLanguage}
        units={units}
        setUnits={setUnits}
      />
      
      <AppearanceSettings 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      
      <AdvancedSettings />
    </div>
  );
};

export default SettingsContent;
