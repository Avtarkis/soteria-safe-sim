
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';

export const NotificationSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Critical Safety Alerts</h3>
              <p className="text-sm text-muted-foreground">Life-threatening emergencies and immediate dangers</p>
            </div>
            <div className="flex items-center h-5">
              <input
                id="critical"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Travel Advisories</h3>
              <p className="text-sm text-muted-foreground">Updates on safety conditions at your destinations</p>
            </div>
            <div className="flex items-center h-5">
              <input
                id="travel"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Family Activity</h3>
              <p className="text-sm text-muted-foreground">Location changes and safety status of family members</p>
            </div>
            <div className="flex items-center h-5">
              <input
                id="family"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Cyber Threats</h3>
              <p className="text-sm text-muted-foreground">Detected cyber security risks and data breaches</p>
            </div>
            <div className="flex items-center h-5">
              <input
                id="cyber"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const AlertDeliveryMethods = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert Delivery Methods</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Push Notifications</h3>
              <p className="text-sm text-muted-foreground">Receive alerts on your device</p>
            </div>
            <div className="flex items-center h-5">
              <input
                id="push"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Email Alerts</h3>
              <p className="text-sm text-muted-foreground">Send alerts to your email address</p>
            </div>
            <div className="flex items-center h-5">
              <input
                id="email"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">SMS Messages</h3>
              <p className="text-sm text-muted-foreground">Send text alerts to your phone</p>
            </div>
            <div className="flex items-center h-5">
              <input
                id="sms"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Emergency Contact Notifications</h3>
              <p className="text-sm text-muted-foreground">Alert your emergency contacts for critical situations</p>
            </div>
            <div className="flex items-center h-5">
              <input
                id="emergency-contacts"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const AlertSettings = () => {
  return (
    <div className="space-y-6">
      <NotificationSettings />
      <AlertDeliveryMethods />
    </div>
  );
};

export default AlertSettings;
