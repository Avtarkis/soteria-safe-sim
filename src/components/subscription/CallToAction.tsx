
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CallToActionProps {
  title: string;
  description: string;
  buttonText: string;
}

const CallToAction = ({ title, description, buttonText }: CallToActionProps) => {
  return (
    <div className="bg-primary text-primary-foreground rounded-lg p-8 text-center">
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="mb-6">{description}</p>
      <Button variant="secondary" size="lg" className="group">
        {buttonText} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );
};

export default CallToAction;
