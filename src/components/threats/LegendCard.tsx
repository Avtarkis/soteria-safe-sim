
import React from 'react';
import { Card } from '@/components/ui/CardWrapper';
import { cn } from '@/lib/utils';

interface LegendCardProps {
  showLegend: boolean;
}

const LegendCard = ({ showLegend }: LegendCardProps) => {
  if (!showLegend) return null;
  
  return (
    <Card className={cn(
      "absolute bottom-4 right-4 z-10 p-3 w-64 shadow-lg",
      "bg-background/90 backdrop-blur-sm border border-border/50"
    )}>
      <div className="text-sm font-semibold mb-2">Threat Legend</div>
      <div className="space-y-2 text-xs">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full mr-2 bg-red-500"></div>
          <span>High Risk Physical Threat</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full mr-2 bg-orange-400"></div>
          <span>Medium Risk Physical Threat</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full mr-2 bg-blue-500"></div>
          <span>Low Risk Physical Threat</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full mr-2 bg-pink-500"></div>
          <span>Cyber Threat</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full mr-2 bg-green-500"></div>
          <span>Environmental Threat</span>
        </div>
        <div className="border-t border-border/50 pt-2 mt-2">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full mr-2 bg-indigo-500 border border-white"></div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center mt-1">
            <div className="w-4 h-4 rounded-full mr-2 animate-pulse bg-indigo-500/50"></div>
            <span>Location Accuracy Range</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LegendCard;
