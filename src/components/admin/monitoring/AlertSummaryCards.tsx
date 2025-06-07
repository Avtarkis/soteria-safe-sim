
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Activity } from 'lucide-react';

interface AlertCounts {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface AlertSummaryCardsProps {
  alertCounts: AlertCounts;
}

const AlertSummaryCards: React.FC<AlertSummaryCardsProps> = ({ alertCounts }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Critical</p>
              <p className="text-2xl font-bold text-red-600">{alertCounts.critical}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">High</p>
              <p className="text-2xl font-bold text-orange-600">{alertCounts.high}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Medium</p>
              <p className="text-2xl font-bold text-yellow-600">{alertCounts.medium}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Low</p>
              <p className="text-2xl font-bold text-blue-600">{alertCounts.low}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertSummaryCards;
