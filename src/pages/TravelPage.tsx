
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, MapPin, Shield, AlertCircle } from 'lucide-react';

const TravelPage = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Travel Safety</h1>
        <p className="text-muted-foreground">
          Stay safe while traveling with real-time safety information
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Globe className="mr-2 h-5 w-5 text-blue-500" />
              Travel Advisories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View current travel advisories and safety information for your destination
            </p>
            <Button variant="outline" className="w-full">
              Check Advisories
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <MapPin className="mr-2 h-5 w-5 text-red-500" />
              Safe Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Find the safest routes to your destination
            </p>
            <Button variant="outline" className="w-full">
              Plan Route
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Shield className="mr-2 h-5 w-5 text-green-500" />
              Safety Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Prepare for your trip with our comprehensive safety checklist
            </p>
            <Button variant="outline" className="w-full">
              View Checklist
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Local Emergency Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select a destination to view local emergency contact information
            </p>
            <div className="flex flex-wrap gap-2">
              <input
                className="flex-1 min-w-[200px] px-3 py-2 border rounded-md"
                placeholder="Enter destination"
              />
              <Button>Search</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TravelPage;
