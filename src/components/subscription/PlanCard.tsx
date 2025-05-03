
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface PlanCardProps {
  title: string;
  description: string;
  price: React.ReactNode;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
  isSelected?: boolean;
  onSubscribe: () => void;
}

const PlanCard = ({
  title,
  description,
  price,
  features,
  buttonText,
  isPopular = false,
  isSelected = false,
  onSubscribe,
}: PlanCardProps) => {
  return (
    <Card className={`border-2 ${isSelected ? 'border-primary' : 'border-border'} hover:shadow-lg transition-all relative`}>
      {isPopular && (
        <div className="absolute -top-3 right-4 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
          Most Popular
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl flex items-center justify-between">
          {title}
          <div>{price}</div>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-6 py-2">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex justify-center pt-6 pb-6">
        <Button 
          className="w-full"
          variant={isPopular ? "default" : "outline"}
          onClick={onSubscribe}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlanCard;
