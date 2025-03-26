
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Check, XCircle, CreditCard, Shield, ArrowRight, Zap, BadgeCheck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    "Unlimited device protection",
    "24/7 priority support",
    "Voice assistant integration",
    "Family protection plan"
  ]
};

interface PricingCardProps {
  type: 'free' | 'premium';
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  popular?: boolean;
}

const PricingCard = ({ 
  type, 
  title, 
  price, 
  period,
  description, 
  features, 
  buttonText, 
  popular 
}: PricingCardProps) => {
  return (
    <Card className={cn(
      "flex flex-col h-full transition-all duration-300",
      popular && "border-2 border-primary shadow-lg scale-105"
    )}>
      <CardHeader>
        {popular && (
          <div className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full self-start mb-2">
            Most Popular
          </div>
        )}
        <CardTitle>{title}</CardTitle>
        <div className="flex items-baseline mt-2">
          <span className="text-3xl font-bold">{price}</span>
          {period && <span className="ml-1.5 text-sm text-muted-foreground">/{period}</span>}
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-baseline gap-2">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
          {type === 'free' && (
            <>
              {['Dark web monitoring', 'Voice assistant integration', 'Family protection plan'].map((feature, i) => (
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
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

const Subscription = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  
  return (
    <div className="container pb-10 animate-fade-in">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
        <p className="text-muted-foreground">
          Choose the right plan for your security needs.
        </p>
      </div>

      {/* Pricing toggle */}
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

      {/* Pricing cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <PricingCard 
          type="free"
          title="Soteria Free"
          price="$0"
          period="forever"
          description="Basic protection for personal use"
          features={features.free}
          buttonText="Get Started"
        />
        
        <PricingCard 
          type="premium"
          title="Soteria Premium"
          price={billingCycle === 'monthly' ? "$4.99" : "$49.99"}
          period={billingCycle === 'monthly' ? "month" : "year"}
          description="Advanced protection for you and your family"
          features={features.premium}
          buttonText="Upgrade Now"
          popular
        />
      </div>

      {/* Feature comparison */}
      <div className="mt-12 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-center mb-8">Compare Features</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="pb-4 text-left">Feature</th>
                <th className="pb-4 text-center">Free</th>
                <th className="pb-4 text-center">Premium</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "AI Threat Detection", free: "Basic", premium: "Advanced" },
                { name: "Emergency Response", free: "Standard", premium: "Priority" },
                { name: "Dark Web Monitoring", free: "Limited", premium: "Comprehensive" },
                { name: "Device Protection", free: "1 Device", premium: "Unlimited" },
                { name: "Voice Assistant", free: "No", premium: "Yes" },
                { name: "Family Protection", free: "No", premium: "Up to 5 members" },
                { name: "Support", free: "Email", premium: "24/7 Priority" },
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
                    ) : (
                      <span className="text-sm font-medium">{feature.premium}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
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

      {/* CTA Section */}
      <div className="mt-16">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-8">
            <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">Upgrade to Premium</h3>
                <p className="text-primary-foreground/90 max-w-md">
                  Get comprehensive protection for just $4.99/month and secure your digital life.
                </p>
              </div>
              <Button className="bg-white text-primary hover:bg-white/90 px-6">
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
