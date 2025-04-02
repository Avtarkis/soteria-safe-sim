
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThreatZone {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  level: 'low' | 'medium' | 'high';
  title: string;
  details: string;
  type?: 'cyber' | 'physical' | 'environmental';
}

interface ThreatDetailsProps {
  selectedThreat: ThreatZone | null;
  clearSelectedThreat: () => void;
}

const ThreatDetails = ({ selectedThreat, clearSelectedThreat }: ThreatDetailsProps) => {
  if (!selectedThreat) return null;

  return (
    <div className="absolute bottom-16 left-4 right-4 z-20 animate-fade-in">
      <Card className="bg-background/95 backdrop-blur-md border shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              {selectedThreat.level === 'high' ? (
                <AlertTriangle className="h-5 w-5 text-threat-high" />
              ) : selectedThreat.level === 'medium' ? (
                <AlertTriangle className="h-5 w-5 text-threat-medium" />
              ) : (
                <Info className="h-5 w-5 text-threat-low" />
              )}
              <CardTitle className="text-base">{selectedThreat.title}</CardTitle>
            </div>
            <button 
              className="text-muted-foreground hover:text-foreground"
              onClick={clearSelectedThreat}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-2">{selectedThreat.details}</p>
          <div className="flex justify-between items-center">
            <span className={cn("text-xs px-2.5 py-1 rounded-full", 
              selectedThreat.level === 'high' ? "bg-threat-high/10 border-threat-high/20 text-threat-high" :
              selectedThreat.level === 'medium' ? "bg-threat-medium/10 border-threat-medium/20 text-threat-medium" :
              "bg-threat-low/10 border-threat-low/20 text-threat-low"
            )}>
              {selectedThreat.level.charAt(0).toUpperCase() + selectedThreat.level.slice(1)} Threat Level
            </span>
            <Button size="sm" variant="outline" className="text-xs gap-1">
              <Shield className="h-3 w-3" />
              View Safety Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThreatDetails;
