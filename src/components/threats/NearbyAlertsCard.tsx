import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { AlertTriangle, CheckCircle2, Info, MapPin, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThreatMarker } from '@/types/threats';
import { useToast } from '@/hooks/use-toast';

interface NearbyAlertsCardProps {
  loading: boolean;
  getNearbyAlerts: () => ThreatMarker[];
}

const NearbyAlertsCard = ({ loading, getNearbyAlerts }: NearbyAlertsCardProps) => {
  const [alerts, setAlerts] = useState<ThreatMarker[]>([]);
  const { toast } = useToast();
  const alertShownRef = React.useRef(false);
  
  useEffect(() => {
    if (!loading) {
      try {
        const nearbyThreats = getNearbyAlerts();
        
        // Filter to ensure we're not showing too many alerts
        const filteredThreats = nearbyThreats.slice(0, 1); // Limit to max 1 alert
        
        // Ensure we don't show high-level alerts too often by downgrading some
        const limitedThreats = filteredThreats.map(threat => {
          // Reduce the chance of high alerts - make all alerts low for now to avoid blinking
          return { ...threat, level: 'low' as 'low' };
        });
        
        setAlerts(limitedThreats);
        
        // Completely disable toast notifications for now to prevent blinking
        // We'll only show in the UI
      } catch (error) {
        console.error("Error loading nearby alerts:", error);
      }
    }
  }, [loading, getNearbyAlerts]);
  
  const getTimeAgo = (index: number) => {
    // More realistic time descriptions
    const times = ['Just now', '5 min ago', '15 min ago', '30 min ago', '1 hour ago'];
    return times[index % times.length];
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-blue-500" />
          Local Notifications
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
              <CheckCircle2 className="h-5 w-5 mx-auto mb-2 text-green-500" />
              <p>All clear in your area</p>
              <p className="text-xs mt-1">No active notifications at this time</p>
            </div>
          ) : (
            alerts.map((alert, index) => (
              <div key={alert.id} className="flex items-start gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  alert.level === 'high' 
                    ? "bg-orange-500/20" 
                    : alert.level === 'medium'
                      ? "bg-yellow-500/20"
                      : "bg-blue-500/20"
                )}>
                  {alert.level === 'high' ? (
                    <Shield className="h-4 w-4 text-orange-500" />
                  ) : alert.level === 'medium' ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <Info className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {alert.type === 'physical' 
                      ? 'Local' 
                      : alert.type === 'cyber' 
                        ? 'Digital' 
                        : 'Weather'} • {getTimeAgo(index)}
                  </p>
                  <div className="mt-1">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full inline-block font-medium",
                      alert.level === 'high' 
                        ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" 
                        : alert.level === 'medium'
                          ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                          : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                    )}>
                      {alert.level === 'high' ? 'Notice' : 
                       alert.level === 'medium' ? 'Info' : 'General Info'}
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
