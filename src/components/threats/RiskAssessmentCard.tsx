
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';

const RiskAssessmentCard = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Your Current Risk Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Overall Risk</span>
          <span className="text-sm font-medium text-threat-low">Low</span>
        </div>
        <div className="h-2 bg-secondary rounded-full mb-4">
          <div className="h-2 bg-threat-low rounded-full w-[20%]"></div>
        </div>
        <div className="text-xs text-muted-foreground">
          <p>Your current location has no significant threats detected at this time. Continue to monitor for updates.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskAssessmentCard;
