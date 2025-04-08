
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PhoneCall, Users, Shield, AlertCircle } from 'lucide-react';

const EmergencyPage = () => {
  const { toast } = useToast();

  const handleEmergency = () => {
    toast({
      title: "Emergency Mode Activated",
      description: "Your emergency contacts will be notified of your situation.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Emergency Services</h1>
        <p className="text-muted-foreground">
          Access emergency assistance and safety features
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <AlertCircle className="mr-2 h-5 w-5 text-destructive" />
              Emergency SOS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Activate emergency mode to alert your emergency contacts and local authorities
            </p>
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={handleEmergency}
            >
              Activate Emergency SOS
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <PhoneCall className="mr-2 h-5 w-5 text-blue-500" />
              Emergency Numbers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Police</span>
                <span className="font-medium">911</span>
              </div>
              <div className="flex justify-between">
                <span>Ambulance</span>
                <span className="font-medium">911</span>
              </div>
              <div className="flex justify-between">
                <span>Fire Department</span>
                <span className="font-medium">911</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Emergency Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <p className="text-muted-foreground">No emergency contacts added</p>
            <Button variant="outline" className="mt-2">
              Add Emergency Contact
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyPage;
