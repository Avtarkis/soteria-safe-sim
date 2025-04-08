
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { PhoneCall, Clock } from 'lucide-react';
import { EmergencyService } from '@/types/disasters.d';

interface EmergencyNumbersCardProps {
  emergencyNumbers: EmergencyService[];
}

const EmergencyNumbersCard = ({ emergencyNumbers }: EmergencyNumbersCardProps) => {
  return (
    <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <PhoneCall className="h-4 w-4 text-red-500" />
          Emergency Numbers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {emergencyNumbers.map((service) => (
            <div key={service.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-100 dark:bg-red-900/30">
                <PhoneCall className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-medium">{service.name}</p>
                <p className="text-sm font-bold text-red-500">{service.phoneNumber}</p>
                {service.response_time && (
                  <p className="text-xs flex items-center text-muted-foreground">
                    <Clock className="h-3 w-3 inline mr-1" />
                    Est. response time: {service.response_time} min
                    <span className="ml-1 text-xs italic">Where every second counts</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyNumbersCard;
