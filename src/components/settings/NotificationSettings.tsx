
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Switch } from '@/components/ui/switch';
import { Bell } from 'lucide-react';

interface NotificationSettingsProps {
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
}

const NotificationSettings = ({ notifications, setNotifications }: NotificationSettingsProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Bell className="h-5 w-5" />
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch 
              checked={notifications.email} 
              onCheckedChange={(checked) => setNotifications({...notifications, email: checked})} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-muted-foreground">Receive alerts on your device</p>
            </div>
            <Switch 
              checked={notifications.push} 
              onCheckedChange={(checked) => setNotifications({...notifications, push: checked})} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Emergency Alerts</p>
              <p className="text-sm text-muted-foreground">Critical safety information</p>
            </div>
            <Switch 
              checked={notifications.emergencyAlerts} 
              onCheckedChange={(checked) => setNotifications({...notifications, emergencyAlerts: checked})} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Security Alerts</p>
              <p className="text-sm text-muted-foreground">Account and safety notifications</p>
            </div>
            <Switch 
              checked={notifications.securityAlerts} 
              onCheckedChange={(checked) => setNotifications({...notifications, securityAlerts: checked})} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Travel Advisories</p>
              <p className="text-sm text-muted-foreground">Travel safety information</p>
            </div>
            <Switch 
              checked={notifications.travelAlerts} 
              onCheckedChange={(checked) => setNotifications({...notifications, travelAlerts: checked})} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
