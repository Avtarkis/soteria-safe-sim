import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Check, Info, Bell, Shield, Clock, MapPin, User, ArrowRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SubscriptionPage = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [currency, setCurrency] = useState<'usd' | 'ngn'>('usd');

  const features = [
    { id: 'ai-threat', name: 'AI Threat Detection', free: 'Basic', premium: 'Advanced', family: 'Advanced+' },
    { id: 'dark-web', name: 'Dark Web Monitoring', free: 'Limited', premium: 'Comprehensive', family: 'Comprehensive' },
    { id: 'devices', name: 'Device Protection', free: '1 Device', premium: '1 Device', family: 'Up to 5 devices' },
    { id: 'voice', name: 'Voice Assistant', free: false, premium: true, family: true },
    { id: 'support', name: 'Support', free: 'Email', premium: '24/7 Priority', family: '24/7 Priority' },
    { id: 'disaster', name: 'Natural Disaster Detection', free: false, premium: true, family: true },
    { id: 'incident', name: 'Live Incident Capturing', free: false, premium: true, family: true },
    { id: 'police', name: 'Instant Police Voice Call', free: false, premium: true, family: true },
    { id: 'radius', name: '200m Radius Alert', free: false, premium: true, family: true },
    { id: 'smartwatch', name: 'Smartwatch Integration', free: false, premium: true, family: true },
    { id: 'safety-ai', name: 'Personalized Safety AI', free: false, premium: true, family: true },
    { id: 'health', name: 'Health Monitoring', free: false, premium: true, family: true },
    { id: 'family-location', name: 'Family Location Sharing', free: false, premium: false, family: true },
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Soteria Free</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-4xl font-bold">$0</div>
                <div className="text-sm text-muted-foreground">/forever</div>
                <div className="mt-2 text-sm">Basic protection for personal use</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="plan" 
                    id="plan-free" 
                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                    defaultChecked
                  />
                  <label htmlFor="plan-free" className="text-sm font-medium">
                    Select Soteria Free
                  </label>
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Basic threat alerts</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Standard emergency response</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Cybersecurity monitoring (limited)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Global threat map (limited)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Email support</span>
                </div>
                <div className="flex items-start gap-2 opacity-40">
                  <Info className="h-4 w-4 mt-0.5" />
                  <span className="text-sm">AI Detected Emergency Alert</span>
                </div>
                <div className="flex items-start gap-2 opacity-40">
                  <Info className="h-4 w-4 mt-0.5" />
                  <span className="text-sm">Natural Disaster Detection</span>
                </div>
                <div className="flex items-start gap-2 opacity-40">
                  <Info className="h-4 w-4 mt-0.5" />
                  <span className="text-sm">Live Incident Capturing</span>
                </div>
                <div className="flex items-start gap-2 opacity-40">
                  <Info className="h-4 w-4 mt-0.5" />
                  <span className="text-sm">AI Threat Detection</span>
                </div>
                <div className="flex items-start gap-2 opacity-40">
                  <Info className="h-4 w-4 mt-0.5" />
                  <span className="text-sm">Smartwatch Integration</span>
                </div>
                <div className="flex items-start gap-2 opacity-40">
                  <Info className="h-4 w-4 mt-0.5" />
                  <span className="text-sm">Police Siren Mode</span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                Get Started
              </Button>
            </CardContent>
          </Card>
          
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
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
          
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
                <th className="py-4 px-4 text-center font-medium">Free</th>
                <th className="py-4 px-4 text-center font-medium">Premium</th>
                <th className="py-4 px-4 text-center font-medium">Family</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature) => (
                <tr key={feature.id} className="border-b">
                  <td className="py-4 px-4">{feature.name}</td>
                  <td className="py-4 px-4 text-center">
                    {typeof feature.free === 'boolean' ? (
                      feature.free ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <Cross className="h-5 w-5 text-muted-foreground mx-auto" />
                      )
                    ) : (
                      feature.free
                    )}
                  </td>
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
        <h2 className="text-2xl font-semibold mb-2">Upgrade Today</h2>
        <p className="mb-6">Choose a premium plan that fits your security needs.</p>
        <Button variant="secondary" size="lg" className="group">
          Get Started <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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

const AlertTriangle = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const Camera = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);

const Phone = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
  </svg>
);

const Mic = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"></path>
    <path d="M19 10v2a7 7 0 01-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
    <line x1="8" y1="23" x2="16" y2="23"></line>
  </svg>
);

const Watch = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="7"></circle>
    <polyline points="12 9 12 12 13.5 13.5"></polyline>
    <path d="M16.51 17.35l-.35 3.83a2 2 0 01-2 1.82H9.83a2 2 0 01-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 019.83 1h4.35a2 2 0 012 1.82l.35 3.83"></path>
  </svg>
);

const Volume2 = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"></path>
  </svg>
);

const Heart = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path>
  </svg>
);

const EyeOff = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

export default SubscriptionPage;
