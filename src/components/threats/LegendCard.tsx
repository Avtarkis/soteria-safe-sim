
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface LegendCardProps {
  showLegend: boolean;
}

const LegendCard: React.FC<LegendCardProps> = ({ showLegend }) => {
  const isMobile = useIsMobile();
  
  // Simplified legend items for better mobile display
  const legendItems = [
    { color: 'bg-red-500', label: 'High Risk' },
    { color: 'bg-orange-400', label: 'Medium Risk' },
    { color: 'bg-blue-400', label: 'Low Risk' },
    { color: 'bg-pink-400', label: 'Cyber Threat' },
    { color: 'bg-green-500', label: 'Environmental' },
  ];

  if (!showLegend) return null;

  return (
    <Card className={cn(
      "absolute z-10 shadow-md", 
      isMobile ? "bottom-16 right-2 left-2 max-w-[calc(100%-1rem)]" : "bottom-4 right-4 w-auto max-w-xs"
    )}>
      <CardContent className="p-3">
        <div className="text-sm font-medium mb-2">Threat Map Legend</div>
        <div className={cn(
          "grid gap-y-1 gap-x-4 text-xs", 
          isMobile ? "grid-cols-2" : "grid-cols-1"
        )}>
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={cn("h-3 w-3 rounded-full", item.color)} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LegendCard;
