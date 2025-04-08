
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const TravelAdvisoryCard = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-primary" />
          <span>Travel Advisory</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="rounded-md bg-amber-50 text-amber-800 px-3 py-2 text-sm">
            <p><strong>Level 2:</strong> Exercise Increased Caution</p>
            <p className="text-xs mt-1">Where every second counts, stay vigilant in public areas.</p>
          </div>
          
          <div className="text-sm text-muted-foreground">
            This area has reported incidents in the past 30 days:
          </div>
          
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 mt-1.5 rounded-full bg-amber-500"></span>
              <div>
                <p className="font-medium">Petty Theft (Minor)</p>
                <p className="text-xs text-muted-foreground">5 incidents last month</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 mt-1.5 rounded-full bg-amber-500"></span>
              <div>
                <p className="font-medium">Traffic Incidents</p>
                <p className="text-xs text-muted-foreground">Moderate risk during rush hour</p>
              </div>
            </li>
          </ul>
          
          <div className="text-xs mt-2">
            Updated 3 hours ago • Data from local authorities
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TravelAdvisoryCard;
