
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { PhoneCall, Clock, Globe, ShieldAlert } from 'lucide-react';
import { EmergencyService } from '@/types/emergency.d';
import { emergencyService } from '@/services/emergencyService';

interface EmergencyNumbersCardProps {
  emergencyNumbers: EmergencyService[];
  userLocation?: [number, number] | null;
  countryCode?: string;
}

const EmergencyNumbersCard = ({ 
  emergencyNumbers: initialEmergencyNumbers,
  userLocation,
  countryCode
}: EmergencyNumbersCardProps) => {
  const [emergencyNumbers, setEmergencyNumbers] = useState<EmergencyService[]>(initialEmergencyNumbers);
  const [locationBased, setLocationBased] = useState<boolean>(false);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);

  // Set default numbers if none are provided
  useEffect(() => {
    if (initialEmergencyNumbers && initialEmergencyNumbers.length > 0) {
      setEmergencyNumbers(initialEmergencyNumbers);
      setLocationBased(true);
    } else {
      // Default emergency numbers if none are provided
      const defaultNumbers: EmergencyService[] = [
        {
          id: '1',
          name: 'Emergency Services',
          type: 'general',
          phoneNumber: '911',
          response_time: 5
        },
        {
          id: '2',
          name: 'Police Department',
          type: 'police',
          phoneNumber: '911',
          response_time: 7
        },
        {
          id: '3',
          name: 'Medical Emergency',
          type: 'medical',
          phoneNumber: '911',
          response_time: 6
        },
        {
          id: '4',
          name: 'Fire Department',
          type: 'fire',
          phoneNumber: '911',
          response_time: 8
        }
      ];
      setEmergencyNumbers(defaultNumbers);
    }
  }, [initialEmergencyNumbers]);

  useEffect(() => {
    const fetchLocationBasedNumbers = async () => {
      if (!userLocation && !countryCode) return;
      
      setLoadingLocation(true);
      try {
        let numbers;
        
        if (userLocation) {
          const [lat, lng] = userLocation;
          numbers = await emergencyService.getEmergencyNumbersByLocation(lat, lng);
          setLocationBased(true);
        } else if (countryCode) {
          numbers = await emergencyService.getEmergencyNumbers(countryCode);
          setLocationBased(true);
        }
        
        if (numbers) {
          const formattedNumbers: EmergencyService[] = [
            {
              id: '1',
              name: 'Emergency Services',
              type: 'general',
              phoneNumber: numbers.general || numbers.police,
              response_time: 5
            },
            {
              id: '2',
              name: 'Police Department',
              type: 'police',
              phoneNumber: numbers.police,
              response_time: 7
            },
            {
              id: '3',
              name: 'Medical Emergency',
              type: 'medical',
              phoneNumber: numbers.ambulance,
              response_time: 6
            },
            {
              id: '4',
              name: 'Fire Department',
              type: 'fire',
              phoneNumber: numbers.fire,
              response_time: 8
            }
          ];
          
          setEmergencyNumbers(formattedNumbers);
        }
      } catch (error) {
        console.error('Error fetching location-based emergency numbers:', error);
      } finally {
        setLoadingLocation(false);
      }
    };
    
    fetchLocationBasedNumbers();
  }, [userLocation, countryCode]);

  return (
    <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <PhoneCall className="h-4 w-4 text-red-500" />
          Emergency Numbers
          {locationBased && (
            <span className="text-xs bg-red-100 dark:bg-red-800/30 text-red-600 dark:text-red-300 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Location-based
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loadingLocation ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
            <span className="ml-2 text-sm text-muted-foreground">Updating emergency numbers...</span>
          </div>
        ) : (
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
            
            <div className="mt-4 pt-3 border-t border-red-200 dark:border-red-800/30">
              <p className="text-xs text-muted-foreground flex items-center">
                <ShieldAlert className="h-3 w-3 mr-1" />
                These numbers work even without network coverage
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmergencyNumbersCard;
