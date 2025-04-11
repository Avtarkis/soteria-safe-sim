
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AccountSettings from '@/components/settings/AccountSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import PrivacySecuritySettings from '@/components/settings/PrivacySecuritySettings';
import RegionalSettings from '@/components/settings/RegionalSettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import AdvancedSettings from '@/components/settings/AdvancedSettings';
import SettingsFooter from '@/components/settings/SettingsFooter';

const SettingsPage = () => {
  const { toast } = useToast();
  
  // Settings state
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    emergencyAlerts: true,
    securityAlerts: true,
    travelAlerts: false,
  });
  const [language, setLanguage] = useState('english');
  const [units, setUnits] = useState('imperial');
  
  // Form state
  const [loading, setLoading] = useState(false);
  
  const handleSaveSettings = () => {
    setLoading(true);
    
    // Simulate saving settings
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    }, 800);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button onClick={handleSaveSettings} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      
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
      
      <SettingsFooter />
    </div>
  );
};

export default SettingsPage;
