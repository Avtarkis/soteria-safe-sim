
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Layers } from 'lucide-react';

const LegendCard = ({ showLegend }: { showLegend: boolean }) => {
  if (!showLegend) return null;
  
  return (
    <div className="absolute top-4 right-4 z-10">
      <Card className="shadow-sm bg-background/80 backdrop-blur-sm w-48">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm flex items-center">
            <Layers className="h-4 w-4 mr-1" />
            Threat Levels
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-1">
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-threat-high mr-2"></span>
              <span>High Risk</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-threat-medium mr-2"></span>
              <span>Medium Risk</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-threat-low mr-2"></span>
              <span>Low Risk</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LegendCard;
