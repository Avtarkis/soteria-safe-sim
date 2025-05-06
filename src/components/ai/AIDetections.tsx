
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertCircle, Volume2, Heart, Clock } from 'lucide-react';
import { useSafetyAIMonitoring } from '@/services/SafetyAIMonitoringService';
import { formatDistanceToNow } from 'date-fns';

interface AIDetectionsProps {
  className?: string;
}

interface DetectionEvent {
  id: string;
  type: 'pose' | 'audio' | 'health';
  subtype?: string;
  details: string;
  timestamp: number;
}

const AIDetections: React.FC<AIDetectionsProps> = ({ className }) => {
  const { status } = useSafetyAIMonitoring();
  const [detectionEvents, setDetectionEvents] = useState<DetectionEvent[]>([]);
  
  // Add mock detection events for demo purposes
  useEffect(() => {
    // Sample events, would normally come from the monitoring services
    const sampleEvents: DetectionEvent[] = [
      {
        id: '1',
        type: 'audio',
        subtype: 'scream',
        details: 'Potential scream detected nearby',
        timestamp: Date.now() - 1000 * 60 * 5 // 5 minutes ago
      },
      {
        id: '2',
        type: 'health',
        subtype: 'fall',
        details: 'Potential fall detected',
        timestamp: Date.now() - 1000 * 60 * 12 // 12 minutes ago
      },
      {
        id: '3',
        type: 'pose',
        subtype: 'weapon',
        details: 'Suspicious motion detected',
        timestamp: Date.now() - 1000 * 60 * 25 // 25 minutes ago
      }
    ];
    
    setDetectionEvents(sampleEvents);
  }, []);
  
  useEffect(() => {
    // Update events when the last events in status change
    const { lastEvents } = status;
    
    Object.entries(lastEvents).forEach(([type, event]) => {
      if (event && !detectionEvents.some(e => 
        e.type === type && 
        Math.abs(e.timestamp - event.timestamp) < 1000
      )) {
        setDetectionEvents(prev => [{
          id: `${type}-${event.timestamp}`,
          type: type as 'pose' | 'audio' | 'health',
          details: event.details,
          timestamp: event.timestamp
        }, ...prev].slice(0, 10)); // Keep only the latest 10 events
      }
    });
  }, [status.lastEvents, detectionEvents]);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'pose':
        return <Activity className="h-5 w-5 text-blue-500" />;
      case 'audio':
        return <Volume2 className="h-5 w-5 text-indigo-500" />;
      case 'health':
        return <Heart className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };
  
  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case 'pose':
        return 'Motion';
      case 'audio':
        return 'Audio';
      case 'health':
        return 'Health';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <span>Recent Detections</span>
          </div>
          
          <Badge variant="outline">
            {detectionEvents.length > 0 ? `${detectionEvents.length} Events` : 'No Events'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {detectionEvents.length > 0 ? (
          <ScrollArea className="h-[200px]">
            <div className="space-y-3">
              {detectionEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="p-2 bg-secondary/30 rounded-md border border-border/50"
                >
                  <div className="flex items-start gap-2">
                    {getEventIcon(event.type)}
                    
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <Badge variant="secondary" className="mb-1">
                            {getEventTypeLabel(event.type)}
                          </Badge>
                          <h4 className="text-sm font-medium">{event.details}</h4>
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No detection events recorded</p>
            <p className="text-xs mt-1">
              {status.active 
                ? "Events will appear here when detected" 
                : "Activate AI monitoring to detect threats"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIDetections;
