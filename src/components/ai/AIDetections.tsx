
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Heart, Thermometer, Shield, AlertTriangle, Activity, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useAIMonitoring from '@/hooks/use-ai-monitoring';
import { AIThreatDetection } from '@/types/ai-monitoring';

const AIDetections: React.FC = () => {
  const { detections, isMonitoring } = useAIMonitoring();

  const getIcon = (detection: AIThreatDetection) => {
    switch (detection.type) {
      case 'health':
        return <Heart className="h-4 w-4 text-rose-500" />;
      case 'environment':
        return <Thermometer className="h-4 w-4 text-amber-500" />;
      case 'security':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-primary" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'text-amber-600 bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400';
      default:
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          <span>AI Detections</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isMonitoring ? (
          <div className="py-8 text-center text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>AI Monitoring is currently disabled</p>
            <p className="text-sm mt-1">Enable monitoring to detect threats</p>
          </div>
        ) : detections.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No threats detected yet</p>
            <p className="text-sm mt-1">AI is actively monitoring</p>
          </div>
        ) : (
          <div className="space-y-3">
            {detections.slice(0, 5).map((detection) => (
              <div 
                key={detection.id} 
                className="p-3 rounded-lg border bg-card"
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    {getIcon(detection)}
                    <span className="font-medium">{detection.type.charAt(0).toUpperCase() + detection.type.slice(1)} Alert</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(detection.severity)}`}>
                    {detection.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm mb-2">{detection.description}</p>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(detection.timestamp), { addSuffix: true })}</span>
                </div>
                {detection.automaticResponseTaken && (
                  <div className="mt-2 text-xs p-1.5 bg-secondary/50 rounded-md">
                    <span className="font-medium">Automatic action:</span> {detection.automaticResponseTaken}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIDetections;
