
import React from 'react';
import { Clock, UserCircle, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';

const SafetyPlan: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Safety Plan</h2>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>AI-Generated Emergency Plan</CardTitle>
            <Button variant="outline" size="sm">Update Plan</Button>
          </div>
          <CardDescription>
            Personalized safety procedures based on your profile and location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Immediate Actions</span>
              </h3>
              <div className="pl-6 space-y-2">
                <div className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-xs">1</span>
                  <p className="text-sm">Use SOS button to alert emergency contacts and authorities.</p>
                </div>
                <div className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-xs">2</span>
                  <p className="text-sm">If possible, move to a safe location highlighted on the map.</p>
                </div>
                <div className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-xs">3</span>
                  <p className="text-sm">Record audio evidence of threats using the voice assistant.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-primary" />
                <span>Safe Locations Nearby</span>
              </h3>
              <div className="pl-6 space-y-2">
                <div className="flex gap-2">
                  <MapPin className="h-4 w-4 text-threat-low flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Police Station</p>
                    <p className="text-xs text-muted-foreground">0.8 miles away - 123 Safety St.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <MapPin className="h-4 w-4 text-threat-low flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Medical Center</p>
                    <p className="text-xs text-muted-foreground">1.2 miles away - 456 Health Ave.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-secondary/40 rounded-lg">
              <p className="text-sm text-muted-foreground">
                This plan is updated automatically based on your location, local emergency services, and threat intelligence. Last updated 2 hours ago.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SafetyPlan;
