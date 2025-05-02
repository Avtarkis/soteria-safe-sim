
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw } from 'lucide-react';
import { useAlerts } from '@/hooks/useAlerts';
import { AlertStatus } from '@/types/alerts';
import { useToast } from '@/hooks/use-toast';
import { AlertsContainer } from '@/components/alerts/AlertsContainer';
import { AlertSettings } from '@/components/alerts/AlertSettings';

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
          <AlertsContainer
            loading={loading}
            error={error}
            getFilteredAlerts={getFilteredAlerts}
            dismissAlert={dismissAlert}
            resolveAlert={resolveAlert}
            handleRefresh={handleRefresh}
            alertStatus="active"
          />
        </TabsContent>
        
        <TabsContent value="dismissed" className="space-y-4">
          <AlertsContainer
            loading={loading}
            error={error}
            getFilteredAlerts={getFilteredAlerts}
            dismissAlert={dismissAlert}
            resolveAlert={resolveAlert}
            handleRefresh={handleRefresh}
            alertStatus="dismissed"
          />
        </TabsContent>
        
        <TabsContent value="resolved" className="space-y-4">
          <AlertsContainer
            loading={loading}
            error={error}
            getFilteredAlerts={getFilteredAlerts}
            dismissAlert={dismissAlert}
            resolveAlert={resolveAlert}
            handleRefresh={handleRefresh}
            alertStatus="resolved"
          />
        </TabsContent>
        
        <TabsContent value="settings">
          <AlertSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlertsPage;
