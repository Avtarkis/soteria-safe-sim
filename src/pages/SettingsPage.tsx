
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import SettingsHeader from '@/components/settings/SettingsHeader';
import SettingsContent from '@/components/settings/SettingsContent';
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
      <SettingsHeader 
        loading={loading} 
        onSave={handleSaveSettings} 
      />
      
      <SettingsContent 
        notifications={notifications}
        setNotifications={setNotifications}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        language={language}
        setLanguage={setLanguage}
        units={units}
        setUnits={setUnits}
      />
      
      <SettingsFooter />
    </div>
  );
};

export default SettingsPage;
