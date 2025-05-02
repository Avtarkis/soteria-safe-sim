
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCard } from '@/components/alerts/AlertCard';
import { Alert, AlertStatus } from '@/types/alerts';

interface AlertsContainerProps {
  loading: boolean;
  error: string | null;
  getFilteredAlerts: (status?: AlertStatus) => Alert[];
  dismissAlert: (alertId: string) => Promise<boolean>;
  resolveAlert: (alertId: string) => Promise<boolean>;
  handleRefresh: () => Promise<void>;
  alertStatus?: AlertStatus;
}

export const AlertsContainer = ({
  loading,
  error,
  getFilteredAlerts,
  dismissAlert,
  resolveAlert,
  handleRefresh,
  alertStatus
}: AlertsContainerProps) => {
  const filteredAlerts = getFilteredAlerts(alertStatus);
  
  if (loading) {
    return (
      <>
        {Array(3).fill(0).map((_, i) => (
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
        ))}
      </>
    );
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
  
  return (
    <>
      {filteredAlerts.map(alert => (
        <AlertCard 
          key={alert.id}
          alert={alert}
          dismissAlert={dismissAlert}
          resolveAlert={resolveAlert}
        />
      ))}
    </>
  );
};

export default AlertsContainer;
