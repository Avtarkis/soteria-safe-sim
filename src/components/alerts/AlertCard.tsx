
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/CardWrapper';
import { 
  AlertTriangle, Bell, Info, Shield, 
  MapPin, Users, CheckCircle, ExternalLink 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertSeverity, AlertCategory } from '@/types/alerts';

interface AlertCardProps {
  alert: Alert;
  dismissAlert: (alertId: string) => Promise<boolean>;
  resolveAlert: (alertId: string) => Promise<boolean>;
}

export const AlertCard = ({ alert, dismissAlert, resolveAlert }: AlertCardProps) => {
  
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

  return (
    <Card key={alert.id} className={`mb-4 ${alert.severity === 'critical' ? 'border-threat-high/30' : ''}`}>
      <CardHeader className="flex flex-row items-center gap-3 py-3">
        {getCategoryIcon(alert.category)}
        <div>
          <h3 className="text-base font-medium">{alert.title}</h3>
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
  );
};

export default AlertCard;
