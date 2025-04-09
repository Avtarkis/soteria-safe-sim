
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
      "absolute z-30 shadow-md", 
      isMobile 
        ? "top-14 right-2 left-auto max-w-[140px] scale-90 origin-top-right" 
        : "bottom-4 right-4 w-auto max-w-xs"
    )}>
      <CardContent className={cn(
        "p-3",
        isMobile && "p-2"
      )}>
        <div className={cn(
          "text-sm font-medium mb-2",
          isMobile && "text-xs"
        )}>
          Map Legend
        </div>
        <div className={cn(
          "grid gap-y-1 gap-x-4", 
          isMobile ? "grid-cols-1 text-[10px]" : "grid-cols-1 text-xs"
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
