
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  items: FaqItem[];
}

const FaqSection = ({ items }: FaqSectionProps) => {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold mb-8 text-center">Frequently Asked Questions</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item, index) => (
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
  );
};

export default FaqSection;
