
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/CardWrapper';
import { AlertTriangle, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DisasterAlert } from '@/types/disasters';
import { useToast } from '@/hooks/use-toast';
import useIsMobile from '@/hooks/useIsMobile';

interface DisasterAlertsCardProps {
  disasterAlerts: DisasterAlert[];
  onRefresh?: () => void;
}

const DisasterAlertsCard = ({ disasterAlerts, onRefresh }: DisasterAlertsCardProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'warning':
        return 'text-red-500';
      case 'watch':
        return 'text-orange-500';
      default:
        return 'text-yellow-500';
    }
  };
  
  const getIconForType = (type: string) => {
    switch (type) {
      case 'earthquake':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'flood':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'wildfire':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'storm':
        return <AlertCircle className="h-4 w-4 text-purple-500" />;
      case 'extreme_heat':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
  };
  
  const getSourceLabel = (alert: DisasterAlert) => {
    if (alert.id.startsWith('eonet-')) {
      return 'NASA EONET';
    }
    return alert.source || 'Disaster Alert';
  };
  
  const handleOpenAlert = (alert: DisasterAlert) => {
    if (alert.url) {
      window.open(alert.url, '_blank');
    } else {
      toast({
        title: alert.title,
        description: alert.description,
      });
    }
  };
  
  if (disasterAlerts.length === 0) {
    return (
      <Card className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Disaster Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-center py-4 text-muted-foreground">
            No active disaster alerts at this time.
          </p>
        </CardContent>
        {onRefresh && (
          <CardFooter>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs" 
              onClick={onRefresh}
            >
              Check for alerts
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  }
  
  // Show more alerts on larger screens
  const alertsToShow = isMobile ? 3 : 4;
  
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
          {disasterAlerts.slice(0, alertsToShow).map((alert, index) => (
            <div 
              key={`disaster-${alert.id || index}`} 
              className="flex items-start gap-3 cursor-pointer hover:bg-orange-100/50 dark:hover:bg-orange-900/40 p-2 rounded-md transition-colors"
              onClick={() => handleOpenAlert(alert)}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-100 dark:bg-orange-900/30">
                {getIconForType(alert.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-medium">{alert.title}</p>
                  {alert.url && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
                </div>
                <p className="text-xs text-muted-foreground">
                  {alert.location} • {alert.region || alert.country}
                </p>
                <p className="text-xs mt-1">
                  <span className={`font-medium ${getSeverityColor(alert.severity)}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    • {getSourceLabel(alert)} • {new Date(alert.date).toLocaleDateString()}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      {onRefresh && (
        <CardFooter className="pt-0">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs" 
            onClick={onRefresh}
          >
            Check for alerts
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default DisasterAlertsCard;
