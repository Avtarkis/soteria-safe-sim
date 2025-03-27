
import React from 'react';
import { Shield, AlertTriangle, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/CardWrapper';
import { cn } from '@/lib/utils';

type ThreatLevel = 'low' | 'medium' | 'high';

interface ThreatCardProps {
  title: string;
  description: string;
  level: ThreatLevel;
  time: string;
  action?: string;
}

const ThreatsCard = ({ title, description, level, time, action }: ThreatCardProps) => {
  const getIcon = () => {
    switch (level) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-threat-high animate-pulse" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-threat-medium" />;
      case 'low':
        return <Info className="h-4 w-4 sm:h-5 sm:w-5 text-threat-low" />;
      default:
        return <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />;
    }
  };

  const getLevelStyles = () => {
    switch (level) {
      case 'high':
        return 'bg-threat-high/10 border-threat-high/20 text-threat-high';
      case 'medium':
        return 'bg-threat-medium/10 border-threat-medium/20 text-threat-medium';
      case 'low':
        return 'bg-threat-low/10 border-threat-low/20 text-threat-low';
      default:
        return 'bg-primary/10 border-primary/20 text-primary';
    }
  };

  return (
    <Card className={cn("border transition-all duration-300 animate-fade-in", 
      level === 'high' ? "border-threat-high/20" : 
      level === 'medium' ? "border-threat-medium/20" : 
      "border-threat-low/20")}>
      <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-4">
        <div className="flex items-center gap-1 sm:gap-2">
          {getIcon()}
          <CardTitle className="text-sm sm:text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0">
        <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className={cn("text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full", getLevelStyles())}>
            {level.charAt(0).toUpperCase() + level.slice(1)} Threat
          </span>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
      </CardContent>
      {action && (
        <CardFooter className="p-3 sm:p-4 pt-0">
          <button className="w-full text-xs py-1 sm:py-1.5 font-medium text-primary hover:underline transition-all">
            {action}
          </button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ThreatsCard;
