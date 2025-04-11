
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Shield } from 'lucide-react';

const PrivacySecuritySettings = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Shield className="h-5 w-5" />
        <CardTitle>Privacy & Security</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Two-Factor Authentication</p>
            <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
          </div>
          <Button variant="outline" size="sm">Enable</Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Location Tracking</p>
            <p className="text-sm text-muted-foreground">Share your location for emergency services</p>
          </div>
          <Switch defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Data Sharing</p>
            <p className="text-sm text-muted-foreground">Allow anonymous data to improve services</p>
          </div>
          <Switch defaultChecked />
        </div>
        
        <div className="pt-2">
          <Button variant="outline" size="sm">
            Change Password
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacySecuritySettings;
