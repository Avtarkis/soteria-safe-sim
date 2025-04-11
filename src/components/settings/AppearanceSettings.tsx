
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Switch } from '@/components/ui/switch';
import { Sun } from 'lucide-react';
import LogoDownloader from '@/components/ui/LogoDownloader';

interface AppearanceSettingsProps {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppearanceSettings = ({ darkMode, setDarkMode }: AppearanceSettingsProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Sun className="h-5 w-5" />
        <CardTitle>Appearance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Dark Mode</p>
            <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
          </div>
          <Switch 
            checked={darkMode} 
            onCheckedChange={setDarkMode} 
          />
        </div>
        
        <div>
          <h3 className="text-lg font-medium">Soteria Logo</h3>
          <p className="text-sm text-muted-foreground mb-4">Download the Soteria logo for your use</p>
          <div className="flex items-center gap-4">
            <img src="/logo.svg" alt="Soteria Logo" className="h-12 w-12" />
            <LogoDownloader />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppearanceSettings;
