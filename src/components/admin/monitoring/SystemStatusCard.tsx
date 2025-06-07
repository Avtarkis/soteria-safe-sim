
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react';

interface SystemStatus {
  service: string;
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  lastCheck: number;
  metrics?: {
    cpu?: number;
    memory?: number;
    requests?: number;
  };
}

interface SystemStatusCardProps {
  status: SystemStatus;
  onRestart: (serviceName: string) => void;
}

const SystemStatusCard: React.FC<SystemStatusCardProps> = ({ status, onRestart }) => {
  const getStatusIcon = (statusType: SystemStatus['status']) => {
    switch (statusType) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (statusType: SystemStatus['status']) => {
    switch (statusType) {
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{status.service}</CardTitle>
          {getStatusIcon(status.status)}
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(status.status)}`} />
          <span className="text-xs text-muted-foreground">
            {status.uptime}% uptime
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {status.metrics && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>CPU</span>
              <span>{status.metrics.cpu}%</span>
            </div>
            <Progress value={status.metrics.cpu} className="h-1" />
            
            <div className="flex justify-between text-sm">
              <span>Memory</span>
              <span>{status.metrics.memory}%</span>
            </div>
            <Progress value={status.metrics.memory} className="h-1" />
            
            <div className="flex justify-between text-sm">
              <span>Requests</span>
              <span>{status.metrics.requests}</span>
            </div>
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            Last check: {new Date(status.lastCheck).toLocaleTimeString()}
          </span>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onRestart(status.service)}
          >
            Restart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatusCard;
