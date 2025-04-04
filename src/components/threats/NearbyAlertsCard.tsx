
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { AlertTriangle, Info, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThreatMarker } from '@/types/threats';

interface NearbyAlertsCardProps {
  loading: boolean;
  getNearbyAlerts: () => ThreatMarker[];
}

const NearbyAlertsCard = ({ loading, getNearbyAlerts }: NearbyAlertsCardProps) => {
  const alerts = getNearbyAlerts();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-red-500" />
          Nearby Alerts
        </CardTitle>
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
          ) : alerts.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-2">
              <p>No nearby alerts detected</p>
              <p className="text-xs mt-1">You're in a safe area right now</p>
            </div>
          ) : (
            alerts.map((alert, index) => (
              <div key={alert.id} className="flex items-start gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  alert.level === 'high' 
                    ? "bg-red-500/20" 
                    : alert.level === 'medium'
                      ? "bg-orange-500/20"
                      : "bg-blue-500/20"
                )}>
                  {alert.level === 'high' || alert.level === 'medium' ? (
                    <AlertTriangle className={cn(
                      "h-4 w-4",
                      alert.level === 'high' ? "text-red-500" : "text-orange-500"
                    )} />
                  ) : (
                    <Info className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {alert.type === 'physical' 
                      ? 'Nearby' 
                      : alert.type === 'cyber' 
                        ? 'Regional' 
                        : 'Weather alert'} • {index * 7 + 3} min ago
                  </p>
                  <div className="mt-1">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full inline-block font-medium",
                      alert.level === 'high' 
                        ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                        : alert.level === 'medium'
                          ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                          : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                    )}>
                      {alert.level.charAt(0).toUpperCase() + alert.level.slice(1)} Risk
                    </span>
                  </div>
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
