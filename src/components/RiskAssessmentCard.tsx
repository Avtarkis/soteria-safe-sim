
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';

const RiskAssessmentCard = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span>Risk Assessment</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium">Overall Risk Level</div>
              <div className="text-sm text-amber-500 font-medium">Moderate</div>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Current area has moderate risk factors. Where every second counts, stay vigilant and keep emergency contacts accessible.
          </div>
          
          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span>Active Hazards</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 mt-1.5 rounded-full bg-amber-500"></span>
                <div>
                  <p className="font-medium">Civil Unrest (2 blocks away)</p>
                  <p className="text-xs text-muted-foreground">Moderate risk - Avoid 5th & Main</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 mt-1.5 rounded-full bg-green-500"></span>
                <div>
                  <p className="font-medium">Road Construction</p>
                  <p className="text-xs text-muted-foreground">Low risk - 10 min delay expected</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskAssessmentCard;
