
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TravelAdvisoryCard = () => {
  const { toast } = useToast();

  const navigateToRoute = (destination: string) => {
    toast({
      title: "Calculating Route",
      description: `Finding the safest route to your ${destination} location...`,
    });
    window.location.href = `/map?destination=${destination}`;
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Travel Advisory</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Safest routes to your saved locations:</p>
        <div className="mt-3 space-y-2">
          <button 
            className="w-full flex items-center justify-between p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
            onClick={() => navigateToRoute('home')}
          >
            <span className="text-sm">Home</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <button 
            className="w-full flex items-center justify-between p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
            onClick={() => navigateToRoute('work')}
          >
            <span className="text-sm">Work</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TravelAdvisoryCard;
