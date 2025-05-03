
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Shield, AlertTriangle, Camera, Phone, Mic, MapPin, Watch, Volume2, Heart, EyeOff } from 'lucide-react';

interface FeatureItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface FeatureShowcaseProps {
  items: FeatureItem[];
}

const FeatureShowcase = ({ items }: FeatureShowcaseProps) => {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold mb-2 text-center">Premium Features</h2>
      <p className="text-center text-muted-foreground mb-8">Click on any feature to see a simulation of how it works</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {items.slice(0, 12).map((feature) => (
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
  );
};

export default FeatureShowcase;
