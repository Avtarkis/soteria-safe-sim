
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Shield, Map, AlertTriangle, Clock } from 'lucide-react';

const NotificationsPage = () => {
  const notifications = [
    {
      id: 1,
      type: 'security',
      title: 'Security Settings Updated',
      message: 'Your security settings were updated successfully.',
      time: '2 hours ago',
      read: true,
    },
    {
      id: 2,
      type: 'alert',
      title: 'New Alert in Your Area',
      message: 'A safety alert has been reported near your location.',
      time: '1 day ago',
      read: false,
    },
    {
      id: 3,
      type: 'travel',
      title: 'Travel Advisory Updated',
      message: 'Travel advisories for your saved destinations have been updated.',
      time: '3 days ago',
      read: true,
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'security':
        return <Shield className="h-5 w-5 text-blue-500" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'travel':
        return <Map className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          View and manage your notifications and alerts
        </p>
      </header>

      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <Button variant="outline" size="sm">All</Button>
          <Button variant="outline" size="sm">Unread</Button>
          <Button variant="outline" size="sm">Alerts</Button>
        </div>
        <Button variant="ghost" size="sm">Mark all as read</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 rounded-lg border ${notification.read ? 'bg-background' : 'bg-muted/50'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="pt-1">{getIcon(notification.type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between">
                        <p className="font-medium">{notification.title}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {notification.time}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No notifications</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You don't have any notifications at the moment
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Security Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Receive alerts about security threats
                </p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Travel Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Updates about travel safety and advisories
                </p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;
