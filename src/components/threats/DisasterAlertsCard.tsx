
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { AlertTriangle, AlertCircle } from 'lucide-react';

interface DisasterAlertsCardProps {
  disasterAlerts: any[];
}

const DisasterAlertsCard = ({ disasterAlerts }: DisasterAlertsCardProps) => {
  if (disasterAlerts.length === 0) return null;
  
  return (
    <Card className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          Disaster Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {disasterAlerts.slice(0, 3).map((alert, index) => (
            <div key={`disaster-${index}`} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-100 dark:bg-orange-900/30">
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium">{alert.title}</p>
                <p className="text-xs text-muted-foreground">
                  {alert.location} • {alert.region}, {alert.country}
                </p>
                <p className="text-xs mt-1 text-orange-600">
                  Where every second counts - stay alert and be prepared.
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DisasterAlertsCard;
