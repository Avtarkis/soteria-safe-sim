
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';
import { Phone, AlertTriangle, Ambulance } from 'lucide-react';

interface EmergencyNumbersCardProps {
  emergencyNumbers: any | null;
}

const EmergencyNumbersCard = ({ emergencyNumbers }: EmergencyNumbersCardProps) => {
  if (!emergencyNumbers) return null;
  
  return (
    <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Phone className="h-4 w-4 text-red-500" />
          Emergency Services
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium mb-3">
          {emergencyNumbers.country} Emergency Numbers:
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center pb-2 border-b border-muted">
            <span className="flex items-center gap-1.5">
              <Ambulance className="h-4 w-4 text-red-500" />
              Ambulance
            </span>
            <Button variant="destructive" size="sm" className="h-7 px-2">
              {emergencyNumbers.ambulance}
            </Button>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-muted">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Police
            </span>
            <Button variant="destructive" size="sm" className="h-7 px-2">
              {emergencyNumbers.police}
            </Button>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Fire
            </span>
            <Button variant="destructive" size="sm" className="h-7 px-2">
              {emergencyNumbers.fire}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyNumbersCard;
