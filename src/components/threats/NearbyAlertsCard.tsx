
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThreatMarker } from '@/types/threats';

interface NearbyAlertsCardProps {
  loading: boolean;
  getNearbyAlerts: () => ThreatMarker[];
}

const NearbyAlertsCard = ({ loading, getNearbyAlerts }: NearbyAlertsCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Nearby Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-muted"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </div>
              </div>
            ))
          ) : (
            getNearbyAlerts().map((alert, index) => (
              <div key={alert.id} className="flex items-start gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  alert.level === 'high' 
                    ? "bg-threat-high/20" 
                    : alert.level === 'medium'
                      ? "bg-threat-medium/20"
                      : "bg-threat-low/20"
                )}>
                  {alert.level === 'high' || alert.level === 'medium' ? (
                    <AlertTriangle className={cn(
                      "h-4 w-4",
                      alert.level === 'high' ? "text-threat-high" : "text-threat-medium"
                    )} />
                  ) : (
                    <Info className="h-4 w-4 text-threat-low" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {alert.type === 'physical' 
                      ? '2.3 miles away' 
                      : alert.type === 'cyber' 
                        ? 'Regional' 
                        : 'Weather alert'} • {index * 15 + 5} min ago
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NearbyAlertsCard;
