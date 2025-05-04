
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Check, Info, Bell, Shield, Clock, MapPin, User, ArrowRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Camera, Phone, Mic, Watch, Volume2, Heart, EyeOff } from 'lucide-react';

const SubscriptionPage = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [currency, setCurrency] = useState<'usd' | 'ngn'>('usd');

  const features = [
    { id: 'ai-threat', name: 'AI Threat Detection', premium: 'Advanced', family: 'Advanced+' },
    { id: 'dark-web', name: 'Dark Web Monitoring', premium: 'Comprehensive', family: 'Comprehensive' },
    { id: 'devices', name: 'Device Protection', premium: '1 Device', family: 'Up to 5 devices' },
    { id: 'voice', name: 'Voice Assistant', premium: true, family: true },
    { id: 'support', name: 'Support', premium: '24/7 Priority', family: '24/7 Priority' },
    { id: 'disaster', name: 'Natural Disaster Detection', premium: true, family: true },
    { id: 'incident', name: 'Live Incident Capturing', premium: true, family: true },
    { id: 'police', name: 'Instant Police Voice Call', premium: true, family: true },
    { id: 'radius', name: '200m Radius Alert', premium: true, family: true },
    { id: 'smartwatch', name: 'Smartwatch Integration', premium: true, family: true },
    { id: 'safety-ai', name: 'Personalized Safety AI', premium: true, family: true },
    { id: 'health', name: 'Health Monitoring', premium: true, family: true },
    { id: 'family-location', name: 'Family Location Sharing', premium: false, family: true },
  ];

  const featureShowcase = [
    {
      id: 'ai-emergency',
      icon: <Bell className="h-6 w-6 text-primary" />,
      title: 'AI Emergency Alert',
      description: 'Instantly notifies family, law enforcement and emergency responders when a threat is detected.'
    },
    {
      id: 'disaster',
      icon: <AlertTriangle className="h-6 w-6 text-primary" />,
      title: 'Natural Disaster Detection',
      description: 'Detects natural disasters and provides safe evacuation routes.'
    },
    {
      id: 'incident',
      icon: <Camera className="h-6 w-6 text-primary" />,
      title: 'Live Incident Capturing',
      description: 'Uses your phone to capture evidence of incidents for sharing with authorities.'
    },
    {
      id: 'police',
      icon: <Phone className="h-6 w-6 text-primary" />,
      title: 'Instant Police Call',
      description: 'Activates an instant police voice call to deter attackers.'
    },
    {
      id: 'ai-threat',
      icon: <Mic className="h-6 w-6 text-primary" />,
      title: 'AI Threat Detection',
      description: 'Recognizes gunshots, screams, and violent incidents.'
    },
    {
      id: 'radius',
      icon: <MapPin className="h-6 w-6 text-primary" />,
      title: '200m Radius Alert',
      description: 'Sends SOS alerts to nearby mobile users for community response.'
    },
    {
      id: 'cyber',
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: 'Cyber Threat Detection',
      description: 'Identifies and blocks digital threats before they compromise your security.'
    },
    {
      id: 'smartwatch',
      icon: <Watch className="h-6 w-6 text-primary" />,
      title: 'Smartwatch Integration',
      description: 'Using DarkTrace Technology, Soteria integrates with smartwatches, causing them to vibrate to warn users of potential threats even when your phone is not accessible.'
    },
    {
      id: 'emergency',
      icon: <Bell className="h-6 w-6 text-primary" />,
      title: 'Emergency Services',
      description: 'Works with emergency service APIs for direct dispatch.'
    },
    {
      id: 'siren',
      icon: <Volume2 className="h-6 w-6 text-primary" />,
      title: 'Police Siren Mode',
      description: 'Plays convincing police siren sounds to deter attackers.'
    },
    {
      id: 'health',
      icon: <Heart className="h-6 w-6 text-primary" />,
      title: 'Health Monitor',
      description: 'Monitors health status and alerts contacts in emergencies.'
    },
    {
      id: 'stealth',
      icon: <EyeOff className="h-6 w-6 text-primary" />,
      title: 'Stealth Mode',
      description: 'Works in the background undetected by attackers.'
    }
  ];

  const faqItems = [
    {
      question: 'Can I cancel my subscription at any time?',
      answer: 'Yes, you can cancel your Premium subscription at any time. You\'ll continue to have access to Premium features until the end of your billing period.'
    },
    {
      question: 'How does the family plan work?',
      answer: 'With the Premium plan, you can add up to 5 family members. Each member will have their own account with full Premium features, all managed from your account.'
    },
    {
      question: 'Will my subscription automatically renew?',
      answer: 'Yes, subscriptions automatically renew to ensure continuous protection. You\'ll be notified before renewal and can cancel anytime.'
    },
    {
      question: 'Is my payment information secure?',
      answer: 'Yes, we use industry-standard encryption for all payments and never store your full credit card details on our servers.'
    }
  ];

  const getIndividualPrice = () =>
    currency === 'usd'
      ? '$4.99'
      : '₦499';

  const getFamilyPrice = () =>
    currency === 'usd'
      ? '$19.99'
      : '₦1,499';

  return (
    <div className="container pb-10 animate-fade-in">
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
        <p className="text-muted-foreground">
          Choose the right plan for your security needs.
        </p>
        <div className="mt-4 text-primary font-semibold bg-primary/10 py-2 px-4 rounded-lg inline-block">
          All plans include a 14-day free trial - cancel anytime
        </div>
      </div>

      <div className="flex justify-center items-center mb-4">
        <span className="text-sm mr-2 font-medium">Currency:</span>
        <button
          className={`px-3 py-1 rounded-l-full border border-primary-foreground/20 transition-colors ${
            currency === 'usd' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
          }`}
          onClick={() => setCurrency('usd')}
        >USD ($)</button>
        <button
          className={`px-3 py-1 rounded-r-full border border-primary-foreground/20 transition-colors ${
            currency === 'ngn' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
          }`}
          onClick={() => setCurrency('ngn')}
        >NGN (₦)</button>
      </div>

      <div className="mb-10">
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center bg-secondary p-1 rounded-full">
            <Button 
              variant={billingCycle === 'monthly' ? 'default' : 'ghost'} 
              className="rounded-full"
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </Button>
            <Button 
              variant={billingCycle === 'annual' ? 'default' : 'ghost'} 
              className="rounded-full relative"
              onClick={() => setBillingCycle('annual')}
            >
              Annual
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                Save 16%
              </span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Premium Plan */}
          <Card className="border-2 border-primary relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
              Most Popular
            </div>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Soteria Premium</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-4xl font-bold">{getIndividualPrice()}</div>
                <div className="text-sm text-muted-foreground">/month</div>
                <div className="mt-2 text-sm">Advanced protection for individuals</div>
                <div className="text-sm text-primary mt-1">14-day free trial</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="plan" 
                    id="plan-premium" 
                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="plan-premium" className="text-sm font-medium">
                    Select Soteria Premium
                  </label>
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Real-time AI threat analysis</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Priority emergency response</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Dark web monitoring</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Global threat map (full access)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">24/7 priority support</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Voice assistant integration</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">AI Detected Emergency Alert</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Natural Disaster Detection</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Live Incident Capturing</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Instant Police Voice Call</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">AI Threat Detection</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">200m Radius Alert</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Cyber Threat Detection</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Smartwatch Integration</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Personalized Safety AI</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Live Location Sharing</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Integration with Worldwide Emergency Services</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Police Siren Mode</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Health Monitor</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Stealth Mode</span>
                </div>
              </div>
              
              <Button className="w-full">
                Protect Me
              </Button>
            </CardContent>
          </Card>
          
          {/* Family Plan */}
          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <span>Soteria Family</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-4xl font-bold">{getFamilyPrice()}</div>
                <div className="text-sm text-muted-foreground">/month</div>
                <div className="mt-2 text-sm">Complete protection for your entire family</div>
                <div className="text-sm text-primary mt-1">14-day free trial</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="plan" 
                    id="plan-family" 
                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="plan-family" className="text-sm font-medium">
                    Select Soteria Family
                  </label>
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Everything in Premium plan</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Up to 5 family members</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Family location sharing</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Family emergency alerts</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Shared safety notifications</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Family check-in system</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Customizable safety zones</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">School & work safety monitoring</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Child-specific threat detection</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Senior citizen monitoring features</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Family emergency response coordination</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Unified family dashboard</span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                Protect My Family
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-8 text-center">Compare Features</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b">
                <th className="py-4 px-4 text-left font-medium">Feature</th>
                <th className="py-4 px-4 text-center font-medium">Premium</th>
                <th className="py-4 px-4 text-center font-medium">Family</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature) => (
                <tr key={feature.id} className="border-b">
                  <td className="py-4 px-4">{feature.name}</td>
                  <td className="py-4 px-4 text-center">
                    {typeof feature.premium === 'boolean' ? (
                      feature.premium ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <Cross className="h-5 w-5 text-muted-foreground mx-auto" />
                      )
                    ) : (
                      feature.premium
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {typeof feature.family === 'boolean' ? (
                      feature.family ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <Cross className="h-5 w-5 text-muted-foreground mx-auto" />
                      )
                    ) : (
                      feature.family
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-2 text-center">Premium Features</h2>
        <p className="text-center text-muted-foreground mb-8">Click on any feature to see a simulation of how it works</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {featureShowcase.slice(0, 12).map((feature) => (
            <Card key={feature.id} className="cursor-pointer hover:border-primary transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center gap-3">
                  {feature.icon}
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-8 text-center">Frequently Asked Questions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqItems.map((item, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{item.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="bg-primary text-primary-foreground rounded-lg p-8 text-center">
        <h2 className="text-2xl font-semibold mb-2">Start Your 14-Day Free Trial Today</h2>
        <p className="mb-6">Choose a premium plan that fits your security needs.</p>
        <Button variant="secondary" size="lg" className="group">
          Get Protected <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

const Cross = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6L6 18"></path>
    <path d="M6 6l12 12"></path>
  </svg>
);

export default SubscriptionPage;
