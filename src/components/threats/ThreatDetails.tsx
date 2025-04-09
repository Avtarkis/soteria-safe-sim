
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, Info, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ThreatDetailsProps {
  selectedThreat: any;
  clearSelectedThreat: () => void;
  className?: string;
}

const ThreatDetails: React.FC<ThreatDetailsProps> = ({ 
  selectedThreat, 
  clearSelectedThreat,
  className
}) => {
  const isMobile = useIsMobile();
  
  if (!selectedThreat) return null;
  
  // Get threat level styling
  const levelColor = 
    selectedThreat.level === 'high' ? 'text-red-500 border-red-500' :
    selectedThreat.level === 'medium' ? 'text-orange-500 border-orange-500' :
    'text-blue-500 border-blue-500';
  
  const levelBg = 
    selectedThreat.level === 'high' ? 'bg-red-50' :
    selectedThreat.level === 'medium' ? 'bg-orange-50' :
    'bg-blue-50';
  
  return (
    <Card className={cn(
      "absolute z-30 shadow-lg border",
      !isMobile ? "right-4 top-4 max-w-sm" : "bottom-16 left-2 right-2 max-h-[40vh] overflow-auto",
      levelBg,
      className
    )}>
      <CardHeader className={cn("pb-2", isMobile && "p-3")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedThreat.level === 'high' ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : (
              <Info className="h-5 w-5 text-blue-500" />
            )}
            <CardTitle className={cn(
              "text-base",
              isMobile && "text-sm"
            )}>
              {selectedThreat.title}
            </CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={clearSelectedThreat} className="-mr-2 h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className={cn(
          "flex items-center gap-1 mt-1",
          levelColor
        )}>
          <span className={cn(
            "inline-block px-2 py-0.5 rounded-full text-xs font-medium border",
            isMobile && "text-[10px] px-1.5",
            levelColor
          )}>
            {selectedThreat.level.toUpperCase()} RISK
          </span>
          {selectedThreat.type && (
            <span className="text-xs text-muted-foreground">
              {selectedThreat.type.charAt(0).toUpperCase() + selectedThreat.type.slice(1)}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className={cn(
        "text-sm space-y-2",
        isMobile && "p-3 pt-0 text-xs"
      )}>
        <p>{selectedThreat.details}</p>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
          <MapPin className="h-3 w-3" />
          <span>
            {selectedThreat.position[0].toFixed(4)}, {selectedThreat.position[1].toFixed(4)}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className={cn(
        "pt-0 flex justify-end gap-2",
        isMobile && "p-3"
      )}>
        <Button 
          variant="ghost" 
          size={isMobile ? "sm" : "default"}
          onClick={clearSelectedThreat}
        >
          Close
        </Button>
        <Button 
          variant="default" 
          size={isMobile ? "sm" : "default"}
          onClick={() => {
            // Trigger map centering event
            const event = new CustomEvent('centerMapOnThreat', {
              detail: { 
                lat: selectedThreat.position[0], 
                lng: selectedThreat.position[1] 
              }
            });
            document.dispatchEvent(event);
          }}
        >
          Show on Map
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ThreatDetails;
