import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, XCircle, CreditCard, Shield, ArrowRight, Zap, BadgeCheck, Clock, Smartphone, Bell, AlertTriangle, MapPin, Camera, Mic, Volume2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const features = {
  free: [
    "Basic threat alerts",
    "Standard emergency response", 
    "Cybersecurity monitoring (limited)",
    "Global threat map (limited)",
    "Email support"
  ],
  premium: [
    "Real-time AI threat analysis",
    "Priority emergency response",
    "Dark web monitoring",
    "Global threat map (full access)",
    "24/7 priority support",
    "Voice assistant integration",
    "AI Detected Emergency Alert",
    "Natural Disaster Detection",
    "Live Incident Capturing",
    "Instant Police Voice Call",
    "AI Threat Detection",
    "200m Radius Alert",
    "Cyber Threat Detection",
    "Smartwatch Integration",
    "Personalized Safety AI",
    "Live Location Sharing",
    "Integration with Worldwide Emergency Services",
    "Police Siren Mode",
    "Health Monitor",
    "Stealth Mode"
  ],
  family: [
    "Everything in Premium plan",
    "Up to 5 family members",
    "Family location sharing",
    "Family emergency alerts",
    "Shared safety notifications",
    "Family check-in system",
    "Customizable safety zones",
    "School & work safety monitoring",
    "Child-specific threat detection",
    "Senior citizen monitoring features",
    "Family emergency response coordination",
    "Unified family dashboard"
  ]
};

interface PricingCardProps {
  type: 'free' | 'premium' | 'family';
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  popular?: boolean;
  isSelected: boolean;
  onSelect: () => void;
  icon?: React.ReactNode;
}

const PricingCard = ({ 
  type, 
  title, 
  price, 
  period,
  description, 
  features, 
  buttonText, 
  popular,
  isSelected,
  onSelect,
  icon
}: PricingCardProps) => {
  return (
    <Card className={cn(
      "flex flex-col h-full transition-all duration-300",
      popular && "border-2 border-primary shadow-lg scale-105",
      isSelected && "ring-2 ring-primary"
    )}>
      <CardHeader>
        {popular && (
          <div className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full self-start mb-2">
            Most Popular
          </div>
        )}
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
        <div className="flex items-baseline mt-2">
          <span className="text-3xl font-bold">{price}</span>
          {period && <span className="ml-1.5 text-sm text-muted-foreground">/{period}</span>}
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <RadioGroup className="mb-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem 
              id={`plan-${type}`} 
              value={type} 
              checked={isSelected}
              onClick={onSelect}
            />
            <Label htmlFor={`plan-${type}`}>Select {title}</Label>
          </div>
        </RadioGroup>
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-baseline gap-2">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
          {type === 'free' && (
            <>
              {[
                'AI Detected Emergency Alert',
                'Natural Disaster Detection',
                'Live Incident Capturing',
                'AI Threat Detection',
                'Smartwatch Integration',
                'Police Siren Mode'
              ].map((feature, i) => (
                <li key={`unavailable-${i}`} className="flex items-baseline gap-2">
                  <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </>
          )}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className={cn("w-full", 
            type === 'free' ? "bg-secondary hover:bg-secondary/80" : ""
          )}
          variant={type === 'free' ? 'secondary' : 'default'}
          onClick={() => {
            onSelect();
            if (type === 'premium') {
              toast({
                title: "Premium Plan Selected",
                description: "You've chosen the Soteria Premium plan. Experience advanced safety features!",
              });
            } else if (type === 'family') {
              toast({
                title: "Family Plan Selected",
                description: "You've chosen the Soteria Family plan. Protection for your entire family!",
              });
            } else {
              toast({
                title: "Free Plan Selected",
                description: "You've chosen the Soteria Free plan.",
              });
            }
          }}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

const FeatureDemo = ({ title, icon: Icon, description, onClick }) => {
  return (
    <Card className="hover:border-primary transition-colors duration-300 cursor-pointer" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

const Subscription = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [demoActive, setDemoActive] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium' | 'family'>('free');
  
  useEffect(() => {
    if (!demoActive) return;
    
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setTimeout(() => {
        if (demoActive === 'emergency') {
          toast({
            title: "Emergency Alert Sent",
            description: "Emergency contacts and authorities have been notified with your location.",
            variant: "destructive",
          });
        } else if (demoActive === 'disaster') {
          toast({
            title: "Natural Disaster Alert",
            description: "Potential flood detected in your area. Evacuation routes have been sent.",
            variant: "destructive",
          });
        } else if (demoActive === 'incident') {
          toast({
            title: "Incident Captured",
            description: "Video and audio evidence has been securely saved and shared with emergency contacts.",
          });
        } else if (demoActive === 'police') {
          toast({
            title: "Police Notification",
            description: "Emergency services have been contacted. Help is on the way.",
            variant: "destructive",
          });
        } else if (demoActive === 'threat') {
          toast({
            title: "Threat Detected",
            description: "Unusual sound pattern detected. Analyzing for potential threats.",
            variant: "default",
          });
        } else if (demoActive === 'radius') {
          toast({
            title: "SOS Alert Broadcast",
            description: "Alert sent to 12 Soteria users within 200m of your location.",
            variant: "destructive",
          });
        } else if (demoActive === 'cyber') {
          toast({
            title: "Cyber Threat Detected",
            description: "Suspicious login attempt blocked from unknown location.",
          });
        } else if (demoActive === 'smartwatch') {
          toast({
            title: "Smartwatch Alert",
            description: "Alert sent to your connected smartwatch.",
          });
        } else if (demoActive === 'ai') {
          toast({
            title: "Safety Recommendation",
            description: "Based on your recent activity, we suggest avoiding this route after 10 PM.",
          });
        } else if (demoActive === 'location') {
          toast({
            title: "Location Shared",
            description: "Your live location is now being shared with your emergency contacts.",
          });
        } else if (demoActive === 'services') {
          toast({
            title: "Emergency Services Connected",
            description: "Your information has been shared with local emergency services.",
            variant: "destructive",
          });
        } else if (demoActive === 'siren') {
          toast({
            title: "Police Siren Activated",
            description: "High-volume police siren sound is now playing from your device.",
          });
        } else if (demoActive === 'health') {
          toast({
            title: "Health Alert",
            description: "Unusual heart rate detected. Monitoring your vitals.",
            variant: "destructive",
          });
        } else if (demoActive === 'stealth') {
          toast({
            title: "Stealth Mode Activated",
            description: "Soteria is now running in the background, invisible to others.",
          });
        }
        
        setDemoActive(null);
        setCountdown(3);
      }, 500);
    }
    
    return () => clearTimeout(timer);
  }, [demoActive, countdown]);
  
  const startDemo = (demo: string) => {
    setDemoActive(demo);
    setCountdown(3);
  };
  
  return (
    <div className="container pb-10 animate-fade-in">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
        <p className="text-muted-foreground">
          Choose the right plan for your security needs.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-secondary p-1 rounded-full flex items-center">
          <button
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              billingCycle === 'monthly' 
                ? "bg-white shadow-sm text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors relative",
              billingCycle === 'annual' 
                ? "bg-white shadow-sm text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setBillingCycle('annual')}
          >
            Annual
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              Save 16%
            </span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <PricingCard 
          type="free"
          title="Soteria Free"
          price="$0"
          period="forever"
          description="Basic protection for personal use"
          features={features.free}
          buttonText="Get Started"
          isSelected={selectedPlan === 'free'}
          onSelect={() => setSelectedPlan('free')}
          icon={<Shield className="h-5 w-5 text-muted-foreground" />}
        />
        
        <PricingCard 
          type="premium"
          title="Soteria Premium"
          price={billingCycle === 'monthly' ? "$4.99" : "$49.99"}
          period={billingCycle === 'monthly' ? "month" : "year"}
          description="Advanced protection for individuals"
          features={features.premium}
          buttonText="Upgrade Now"
          popular
          isSelected={selectedPlan === 'premium'}
          onSelect={() => setSelectedPlan('premium')}
          icon={<Shield className="h-5 w-5 text-primary" />}
        />
        
        <PricingCard 
          type="family"
          title="Soteria Family"
          price={billingCycle === 'monthly' ? "$19.99" : "$199.99"}
          period={billingCycle === 'monthly' ? "month" : "year"}
          description="Complete protection for your entire family"
          features={features.family}
          buttonText="Protect My Family"
          isSelected={selectedPlan === 'family'}
          onSelect={() => setSelectedPlan('family')}
          icon={<Users className="h-5 w-5 text-blue-500" />}
        />
      </div>

      <div className="mt-12 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-center mb-8">Compare Features</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="pb-4 text-left">Feature</th>
                <th className="pb-4 text-center">Free</th>
                <th className="pb-4 text-center">Premium</th>
                <th className="pb-4 text-center">Family</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "AI Threat Detection", free: "Basic", premium: "Advanced", family: "Advanced+" },
                { name: "Emergency Response", free: "Standard", premium: "Priority", family: "Priority+" },
                { name: "Dark Web Monitoring", free: "Limited", premium: "Comprehensive", family: "Comprehensive" },
                { name: "Device Protection", free: "1 Device", premium: "1 Device", family: "Up to 5 devices" },
                { name: "Voice Assistant", free: "No", premium: "Yes", family: "Yes" },
                { name: "Support", free: "Email", premium: "24/7 Priority", family: "24/7 Priority" },
                { name: "Natural Disaster Detection", free: "No", premium: "Yes", family: "Yes" },
                { name: "Live Incident Capturing", free: "No", premium: "Yes", family: "Yes" },
                { name: "Instant Police Voice Call", free: "No", premium: "Yes", family: "Yes" },
                { name: "200m Radius Alert", free: "No", premium: "Yes", family: "Yes" },
                { name: "Smartwatch Integration", free: "No", premium: "Yes", family: "Yes" },
                { name: "Personalized Safety AI", free: "No", premium: "Yes", family: "Yes" },
                { name: "Health Monitoring", free: "No", premium: "Yes", family: "Yes" },
                { name: "Family Location Sharing", free: "No", premium: "No", family: "Yes" },
                { name: "Family Emergency Alerts", free: "No", premium: "No", family: "Yes" },
                { name: "Safety Zones", free: "No", premium: "No", family: "Yes" },
                { name: "School Safety Monitoring", free: "No", premium: "No", family: "Yes" },
                { name: "Child Threat Detection", free: "No", premium: "No", family: "Yes" },
              ].map((feature, idx) => (
                <tr key={idx} className="border-b last:border-b-0">
                  <td className="py-4 text-sm">{feature.name}</td>
                  <td className="py-4 text-center">
                    {feature.free === "No" ? (
                      <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                    ) : (
                      <span className="text-sm">{feature.free}</span>
                    )}
                  </td>
                  <td className="py-4 text-center">
                    {feature.premium === "Yes" ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : feature.premium === "No" ? (
                      <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                    ) : (
                      <span className="text-sm font-medium">{feature.premium}</span>
                    )}
                  </td>
                  <td className="py-4 text-center">
                    {feature.family === "Yes" ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : feature.family === "No" ? (
                      <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                    ) : (
                      <span className="text-sm font-medium">{feature.family}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-12 max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-center mb-2">Try Premium Features</h2>
        <p className="text-center text-muted-foreground mb-8">Click on any feature to see a simulation of how it works</p>
        
        {demoActive ? (
          <Card className="animate-pulse">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  {demoActive === 'emergency' && <Bell className="h-8 w-8 text-threat-high animate-pulse" />}
                  {demoActive === 'disaster' && <AlertTriangle className="h-8 w-8 text-threat-high animate-pulse" />}
                  {demoActive === 'incident' && <Camera className="h-8 w-8 text-primary animate-pulse" />}
                  {demoActive === 'police' && <Volume2 className="h-8 w-8 text-threat-high animate-pulse" />}
                  {demoActive === 'threat' && <AlertTriangle className="h-8 w-8 text-threat-medium animate-pulse" />}
                  {demoActive === 'radius' && <MapPin className="h-8 w-8 text-threat-high animate-pulse" />}
                  {demoActive === 'cyber' && <Shield className="h-8 w-8 text-primary animate-pulse" />}
                  {demoActive === 'smartwatch' && <Smartphone className="h-8 w-8 text-primary animate-pulse" />}
                  {demoActive === 'ai' && <Zap className="h-8 w-8 text-primary animate-pulse" />}
                  {demoActive === 'location' && <MapPin className="h-8 w-8 text-primary animate-pulse" />}
                  {demoActive === 'services' && <Bell className="h-8 w-8 text-threat-high animate-pulse" />}
                  {demoActive === 'siren' && <Volume2 className="h-8 w-8 text-threat-high animate-pulse" />}
                  {demoActive === 'health' && <AlertTriangle className="h-8 w-8 text-threat-medium animate-pulse" />}
                  {demoActive === 'stealth' && <Shield className="h-8 w-8 text-primary animate-pulse" />}
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-3">
                {demoActive === 'emergency' && "AI Emergency Alert"}
                {demoActive === 'disaster' && "Natural Disaster Detection"}
                {demoActive === 'incident' && "Live Incident Capturing"}
                {demoActive === 'police' && "Instant Police Voice Call"}
                {demoActive === 'threat' && "AI Threat Detection"}
                {demoActive === 'radius' && "200m Radius Alert"}
                {demoActive === 'cyber' && "Cyber Threat Detection"}
                {demoActive === 'smartwatch' && "Smartwatch Integration"}
                {demoActive === 'ai' && "Personalized Safety AI"}
                {demoActive === 'location' && "Live Location Sharing"}
                {demoActive === 'services' && "Emergency Services Integration"}
                {demoActive === 'siren' && "Police Siren Mode"}
                {demoActive === 'health' && "Health Monitoring"}
                {demoActive === 'stealth' && "Stealth Mode"}
              </h3>
              <p className="mb-4">Simulating feature... {countdown}</p>
              <Button 
                variant="outline"
                onClick={() => {
                  setDemoActive(null);
                  setCountdown(3);
                }}
              >
                Cancel Demo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FeatureDemo 
              title="AI Emergency Alert" 
              icon={Bell}
              description="Instantly notifies family, law enforcement and emergency responders when a threat is detected."
              onClick={() => startDemo('emergency')}
            />
            
            <FeatureDemo 
              title="Natural Disaster Detection" 
              icon={AlertTriangle}
              description="Detects natural disasters and provides safe evacuation routes."
              onClick={() => startDemo('disaster')}
            />
            
            <FeatureDemo 
              title="Live Incident Capturing" 
              icon={Camera}
              description="Uses your phone to capture evidence of incidents for sharing with authorities."
              onClick={() => startDemo('incident')}
            />
            
            <FeatureDemo 
              title="Instant Police Call" 
              icon={Smartphone}
              description="Activates an instant police voice call to deter attackers."
              onClick={() => startDemo('police')}
            />
            
            <FeatureDemo 
              title="AI Threat Detection" 
              icon={Mic}
              description="Recognizes gunshots, screams, and violent incidents."
              onClick={() => startDemo('threat')}
            />
            
            <FeatureDemo 
              title="200m Radius Alert" 
              icon={MapPin}
              description="Sends SOS alerts to nearby mobile users for community response."
              onClick={() => startDemo('radius')}
            />
            
            <FeatureDemo 
              title="Cyber Threat Detection" 
              icon={Shield}
              description="AI-driven monitoring detects suspicious online activity."
              onClick={() => startDemo('cyber')}
            />
            
            <FeatureDemo 
              title="Smartwatch Integration" 
              icon={Clock}
              description="Smartwatch vibration alerts for potential threats."
              onClick={() => startDemo('smartwatch')}
            />
            
            <FeatureDemo 
              title="Personalized Safety AI" 
              icon={Zap}
              description="Learns your routines to provide tailored safety assistance."
              onClick={() => startDemo('ai')}
            />
            
            <FeatureDemo 
              title="Live Location Sharing" 
              icon={MapPin}
              description="Real-time location sharing with trusted contacts."
              onClick={() => startDemo('location')}
            />
            
            <FeatureDemo 
              title="Emergency Services" 
              icon={Bell}
              description="Works with emergency service APIs for direct dispatch."
              onClick={() => startDemo('services')}
            />
            
            <FeatureDemo 
              title="Police Siren Mode" 
              icon={Volume2}
              description="Plays convincing police siren sounds to deter attackers."
              onClick={() => startDemo('siren')}
            />
            
            <FeatureDemo 
              title="Health Monitor" 
              icon={AlertTriangle}
              description="Monitors health status and alerts contacts in emergencies."
              onClick={() => startDemo('health')}
            />
            
            <FeatureDemo 
              title="Stealth Mode" 
              icon={Shield}
              description="Works in the background undetected by attackers."
              onClick={() => startDemo('stealth')}
            />
          </div>
        )}
      </div>

      <div className="mt-12 max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-center mb-8">Premium Features</h2>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-3">AI Detected Emergency Alert</h3>
              <p className="text-sm text-muted-foreground">
                Instantly notifies family, law enforcement and emergency responders as soon as a threat is detected, 
                ensuring rapid response when you need it most.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-3">Natural Disaster Detection</h3>
              <p className="text-sm text-muted-foreground">
                Soteria uses NASA's Earth API to detect natural disasters before they occur and provides safe 
                evacuation routes while alerting family and rescue teams.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-3">Live Incident Capturing</h3>
              <p className="text-sm text-muted-foreground">
                Uses your phone's camera and sound recorder to capture live video, images and voices of incidents 
                for sharing with law enforcement, family and emergency responders.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-3">AI Threat Detection</h3>
              <p className="text-sm text-muted-foreground">
                Advanced AI algorithms recognize gunshots, screams, and violent incidents, providing 
                early warning and automated response protocols.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-3">Smartwatch Integration</h3>
              <p className="text-sm text-muted-foreground">
                Using DarkTrace Technology, Soteria integrates with smartwatches, causing them to vibrate 
                to warn users of potential threats even when your phone is not accessible.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-12 max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-center mb-8">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {[
            { 
              question: "Can I cancel my subscription at any time?", 
              answer: "Yes, you can cancel your Premium subscription at any time. You'll continue to have access to Premium features until the end of your billing period." 
            },
            { 
              question: "How does the family plan work?", 
              answer: "With the Premium plan, you can add up to 5 family members. Each member will have their own account with full Premium features, all managed from your account." 
            },
            { 
              question: "Will my subscription automatically renew?", 
              answer: "Yes, subscriptions automatically renew to ensure continuous protection. You'll be notified before renewal and can cancel anytime." 
            },
            { 
              question: "Is my payment information secure?", 
              answer: "Yes, we use industry-standard encryption for all payments and never store your full credit card details on our servers." 
            },
          ].map((item, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{item.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-8">
            <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">Upgrade Today</h3>
                <p className="text-primary-foreground/90 max-w-md">
                  {selectedPlan === 'premium' 
                    ? "Get comprehensive protection for just $4.99/month and secure your digital life."
                    : selectedPlan === 'family'
                      ? "Protect your entire family for $19.99/month with our comprehensive Family plan."
                      : "Choose a premium plan that fits your security needs."}
                </p>
              </div>
              <Button className="bg-white text-primary hover:bg-white/90 px-6"
                onClick={() => {
                  toast({
                    title: selectedPlan === 'premium' ? "Premium Subscription" : selectedPlan === 'family' ? "Family Subscription" : "Subscription",
                    description: "You're being redirected to complete your subscription.",
                  });
                }}
              >
                <span>Get Started</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Subscription;
