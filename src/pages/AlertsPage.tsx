
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { AlertTriangle, Bell, Info, Shield, MapPin, Users, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAlerts } from '@/hooks/useAlerts';
import { AlertSeverity, AlertCategory, AlertStatus } from '@/types/alerts';
import { useToast } from '@/hooks/use-toast';

const AlertsPage = () => {
  const { alerts, loading, error, fetchAlerts, dismissAlert, resolveAlert, getFilteredAlerts } = useAlerts();
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const activeAlertCount = alerts.filter(alert => alert.status === 'active').length;
  const dismissedAlertCount = alerts.filter(alert => alert.status === 'dismissed').length;
  const resolvedAlertCount = alerts.filter(alert => alert.status === 'resolved').length;

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
    toast({
      title: "Alerts Refreshed",
      description: "Your alerts have been updated with the latest information."
    });
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return 'text-threat-high bg-threat-high/10 border-threat-high/20';
      case 'warning':
        return 'text-amber-500 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-500 border-amber-500/20';
      case 'info':
      default:
        return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-500 border-blue-500/20';
    }
  };

  const getCategoryIcon = (category: AlertCategory) => {
    switch (category) {
      case 'security':
        return <Shield className="h-5 w-5 text-orange-500" />;
      case 'health':
        return <AlertTriangle className="h-5 w-5 text-threat-high" />;
      case 'environmental':
        return <MapPin className="h-5 w-5 text-green-500" />;
      case 'travel':
        return <MapPin className="h-5 w-5 text-amber-500" />;
      case 'family':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'cyber':
        return <Shield className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} days ago`;
    
    const months = Math.floor(days / 30);
    return `${months} months ago`;
  };

  const renderAlertCards = (alertStatus?: AlertStatus) => {
    const filteredAlerts = getFilteredAlerts(alertStatus);
    
    if (loading) {
      return Array(3).fill(0).map((_, i) => (
        <Card key={`skeleton-${i}`} className="mb-4">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <div className="flex justify-end gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-32" />
            </div>
          </CardContent>
        </Card>
      ));
    }
    
    if (error) {
      return (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Error Loading Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    if (filteredAlerts.length === 0) {
      return (
        <Card className="mb-4">
          <CardContent className="pt-6 pb-6 text-center">
            <CheckCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              {alertStatus === 'active' ? 'No active alerts at this time.' : 
               alertStatus === 'dismissed' ? 'No dismissed alerts.' : 
               alertStatus === 'resolved' ? 'No resolved alerts.' : 
               'No alerts found.'}
            </p>
          </CardContent>
        </Card>
      );
    }
    
    return filteredAlerts.map(alert => (
      <Card key={alert.id} className={`mb-4 ${alert.severity === 'critical' ? 'border-threat-high/30' : ''}`}>
        <CardHeader className="flex flex-row items-center gap-3 py-3">
          {getCategoryIcon(alert.category)}
          <div>
            <CardTitle className="text-base">{alert.title}</CardTitle>
            <p className="text-xs text-muted-foreground">{getTimeSince(alert.createdAt)}</p>
          </div>
          <div className={`ml-auto ${getSeverityColor(alert.severity)} text-xs font-medium px-2 py-1 rounded-full border`}>
            {alert.severity === 'critical' ? 'Critical' : 
             alert.severity === 'warning' ? 'Warning' : 'Info'}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-3">{alert.description}</p>
          <div className="flex items-center justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => dismissAlert(alert.id)}
              disabled={alert.status !== 'active'}
            >
              {alert.status === 'active' ? 'Dismiss' : 'Dismissed'}
            </Button>
            {alert.actionText && (
              <Button 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => {
                  if (alert.actionLink) {
                    window.open(alert.actionLink, '_blank');
                  } else {
                    resolveAlert(alert.id);
                  }
                }}
              >
                {alert.actionText}
                {alert.actionLink && <ExternalLink className="h-3 w-3 ml-1" />}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    ));
  };

  return (
    <div className="container pb-10 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
          <p className="text-muted-foreground">
            View and manage your safety alerts and notifications.
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          disabled={refreshing || loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="mb-4">
          <TabsTrigger value="active" className="flex items-center gap-1">
            Active
            {activeAlertCount > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
                {activeAlertCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="dismissed" className="flex items-center gap-1">
            Dismissed
            {dismissedAlertCount > 0 && (
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                {dismissedAlertCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="resolved" className="flex items-center gap-1">
            Resolved
            {resolvedAlertCount > 0 && (
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                {resolvedAlertCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          {renderAlertCards('active')}
        </TabsContent>
        
        <TabsContent value="dismissed" className="space-y-4">
          {renderAlertCards('dismissed')}
        </TabsContent>
        
        <TabsContent value="resolved" className="space-y-4">
          {renderAlertCards('resolved')}
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlertsPage;
