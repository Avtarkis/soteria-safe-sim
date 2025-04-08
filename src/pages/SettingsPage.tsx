
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import LogoDownloader from '@/components/ui/LogoDownloader';

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
      
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Account settings will be available in a future update.
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Notification settings will be available in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
