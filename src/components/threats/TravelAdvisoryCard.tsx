
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';
import { Route, Globe, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TravelAdvisoryCard = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-500" />
          Travel Advisory
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
              <ShieldAlert className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Local Travel Advisory</p>
              <p className="text-xs text-muted-foreground">
                Travel advisories for your current area. Every second counts when traveling safely.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
              <Route className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium">AI-Powered Safe Routes</p>
              <p className="text-xs text-muted-foreground">
                Get AI-generated safest routes based on real-time threats. Where every second counts.
              </p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2"
            onClick={() => navigate('/travel')}
          >
            Plan Safe Travel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TravelAdvisoryCard;
