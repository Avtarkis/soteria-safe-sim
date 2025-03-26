import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Phone, 
  UserCircle, 
  MapPin, 
  Plus, 
  MessageSquare, 
  Clock, 
  X, 
  Check, 
  LifeBuoy, 
  Mic, 
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const EmergencyContacts = [
  { name: 'John Smith', relationship: 'Brother', phone: '+1 (555) 123-4567' },
  { name: 'Sarah Johnson', relationship: 'Friend', phone: '+1 (555) 987-6543' },
  { name: 'Emergency Services', relationship: 'Public Service', phone: '911' },
];

const EmergencyResponse = () => {
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [listening, setListening] = useState(false);
  
  const startEmergency = () => {
    setShowConfirmation(true);
  };
  
  const cancelEmergency = () => {
    setShowConfirmation(false);
    setEmergencyActive(false);
    setCountdown(5);
  };
  
  const confirmEmergency = () => {
    setShowConfirmation(false);
    setEmergencyActive(true);
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const toggleListening = () => {
    setListening(!listening);
    if (!listening) {
      toast({
        title: "Voice Assistant Active",
        description: "Listening for commands..."
      });
      setTimeout(() => {
        setListening(false);
      }, 5000);
    }
  };

  return (
    <div className="container pb-10 animate-fade-in">
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Emergency Response</h1>
        <p className="text-muted-foreground">
          Quick access to emergency features and contacts when you need help.
        </p>
      </div>

      {/* SOS Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <Card className={cn(
            "border-2 transition-all duration-300",
            emergencyActive ? "border-threat-high" : "border-border"
          )}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LifeBuoy className="h-5 w-5 text-threat-high" />
                <span>SOS Emergency Alert</span>
              </CardTitle>
              <CardDescription>
                Activate to send alerts to your emergency contacts with your current location
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!emergencyActive && !showConfirmation ? (
                <div className="flex flex-col items-center py-8">
                  <button 
                    onClick={startEmergency}
                    className={cn(
                      "w-32 h-32 rounded-full flex items-center justify-center text-white font-bold relative",
                      "bg-threat-high hover:bg-threat-high/90 transition-all duration-300",
                      "focus:outline-none focus:ring-4 focus:ring-threat-high/50"
                    )}
                  >
                    <div className="absolute w-full h-full rounded-full bg-threat-high/20 animate-ping"></div>
                    <div className="text-xl">SOS</div>
                  </button>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Press the SOS button to send an emergency alert
                  </p>
                </div>
              ) : showConfirmation ? (
                <div className="flex flex-col items-center py-6 animate-fade-in">
                  <div className="text-center mb-6">
                    <AlertTriangle className="h-16 w-16 text-threat-high mx-auto mb-3" />
                    <h3 className="text-lg font-semibold mb-2">Confirm Emergency Alert</h3>
                    <p className="text-sm text-muted-foreground">
                      This will notify your emergency contacts with your location
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      onClick={cancelEmergency}
                      className="gap-1"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </Button>
                    <Button 
                      onClick={confirmEmergency}
                      className="gap-1 bg-threat-high hover:bg-threat-high/90"
                    >
                      <Check className="h-4 w-4" />
                      <span>Confirm Emergency</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <div className="bg-threat-high/10 text-threat-high p-4 rounded-lg mb-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium mb-1">Emergency Alert Active</h4>
                      <p className="text-sm">
                        {countdown > 0 
                          ? `Sending alerts to contacts in ${countdown} seconds...` 
                          : 'Emergency contacts have been notified with your location.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-secondary/40 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Sharing your live location</span>
                      </div>
                      <span className="animate-pulse text-xs bg-threat-high/20 text-threat-high px-2 py-0.5 rounded-full">
                        Live
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-secondary/40 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Emergency services notified</span>
                      </div>
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <Button 
                      onClick={cancelEmergency}
                      variant="outline" 
                      className="w-full gap-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel Emergency</span>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                <span>AI Voice Assistant</span>
              </CardTitle>
              <CardDescription>
                Hands-free emergency help via voice commands
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-4">
                <button
                  onClick={toggleListening}
                  className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
                    "focus:outline-none focus:ring-4 focus:ring-primary/30",
                    listening 
                      ? "bg-primary text-white shadow-lg animate-pulse" 
                      : "bg-secondary text-primary hover:bg-secondary/80"
                  )}
                >
                  {listening ? (
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      </div>
                      <Mic className="h-6 w-6 opacity-0" />
                    </div>
                  ) : (
                    <Mic className="h-6 w-6" />
                  )}
                </button>
                <p className="mt-4 text-sm text-center text-muted-foreground">
                  {listening 
                    ? "Listening... Try saying:\n\"Soteria, I need help\"" 
                    : "Tap to activate voice assistant"}
                </p>
              </div>
              
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <p className="font-medium">Voice Commands:</p>
                <ul className="space-y-1">
                  <li className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                    "Soteria, call emergency services"
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                    "Soteria, send my location to contacts"
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                    "Soteria, activate silent alarm"
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Emergency Contacts Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Emergency Contacts</h2>
          <Button variant="outline" size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            <span>Add Contact</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {EmergencyContacts.map((contact, index) => (
            <Card key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{contact.name}</h3>
                    <p className="text-xs text-muted-foreground">{contact.relationship}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" className="w-full gap-1">
                    <Phone className="h-3 w-3" />
                    <span className="text-xs">Call</span>
                  </Button>
                  <Button size="sm" variant="outline" className="w-full gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span className="text-xs">Message</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Emergency Plan Section */}
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
    </div>
  );
};

export default EmergencyResponse;
