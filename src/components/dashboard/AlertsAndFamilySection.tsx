import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';
import { ListChecks, ChevronRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AIThreatDetection } from '@/types/ai-monitoring';

const threatLevelStyles = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

// Accept AIThreatDetection[] instead of Detection[]
const AlertsAndFamilySection = ({ detections }: { detections: AIThreatDetection[] }) => {
  return (
    <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Recent AI Detections
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/emergency">
              View All
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {detections.length > 0 ? (
            detections.slice(0, 3).map((detection, index) => (
              <div key={detection.id || index} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{detection.type} {detection.severity}</p>
                  <p className="text-xs text-muted-foreground">{detection.description || detection.details || 'No description available'}</p>
                </div>
                <span className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  detection.severity === 'critical' ? threatLevelStyles.high :
                  detection.severity === 'high' ? threatLevelStyles.high : 
                  detection.severity === 'medium' ? threatLevelStyles.medium : 
                  threatLevelStyles.low
                )}>
                  {detection.severity}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground">No AI detections found.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Family Safety
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/family">
              Manage Family
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            Monitor your family members' safety and receive real-time notifications.
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Sarah (School)</span>
              </div>
              <span className="text-xs text-muted-foreground">Updated 2m ago</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">John (Work)</span>
              </div>
              <span className="text-xs text-muted-foreground">Updated 15m ago</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-sm">Grandma (Home)</span>
              </div>
              <span className="text-xs text-muted-foreground">2h inactive</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertsAndFamilySection;
