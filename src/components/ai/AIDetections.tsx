
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Shield, AlertTriangle, Zap, HeartPulse, LocateFixed } from 'lucide-react';
import { useAIMonitoring } from '@/hooks/use-ai-monitoring';
import { Button } from '@/components/ui/button';
import { AIThreatDetection } from '@/types/ai-monitoring';
import { cn } from '@/lib/utils';

const AIDetections = () => {
  const { detections } = useAIMonitoring();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'health' | 'environment' | 'security'>('all');

  // Filter detections by category
  const filteredDetections = selectedCategory === 'all' 
    ? detections 
    : detections.filter(detection => detection.type === selectedCategory);

  // Get icon based on detection type
  const getIcon = (detection: AIThreatDetection) => {
    switch (detection.type) {
      case 'health':
        return <HeartPulse className="h-4 w-4 text-red-500" />;
      case 'environment':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'security':
        return <Zap className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Get severity style
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'low':
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
  };

  // Format time as relative
  const formatTimeSince = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      return `${diffHours}h ago`;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">AI Threat Detections</CardTitle>
        <LocateFixed className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Button 
              variant={selectedCategory === 'all' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Button>
            <Button 
              variant={selectedCategory === 'health' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setSelectedCategory('health')}
              className="flex items-center gap-1"
            >
              <HeartPulse className="h-3 w-3" />
              Health
            </Button>
            <Button 
              variant={selectedCategory === 'environment' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setSelectedCategory('environment')}
              className="flex items-center gap-1"
            >
              <Shield className="h-3 w-3" />
              Environment
            </Button>
            <Button 
              variant={selectedCategory === 'security' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setSelectedCategory('security')}
              className="flex items-center gap-1"
            >
              <Zap className="h-3 w-3" />
              Security
            </Button>
          </div>
          
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {filteredDetections.length > 0 ? (
              filteredDetections.map((detection, index) => (
                <div key={detection.id || index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getIcon(detection)}
                      <span className="font-medium text-sm capitalize">
                        {detection.type} {detection.subtype.replace(/-/g, ' ')}
                      </span>
                    </div>
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      getSeverityStyle(detection.severity)
                    )}>
                      {detection.severity}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {detection.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs text-muted-foreground">
                      {formatTimeSince(detection.timestamp)}
                    </div>
                    
                    {detection.automaticResponseTaken && (
                      <div className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        Auto-response taken
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
                <p>No {selectedCategory === 'all' ? '' : selectedCategory} threats detected.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIDetections;
