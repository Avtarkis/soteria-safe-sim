
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SupportFaq = () => {
  const faqs = [
    {
      question: "How do I add family members?",
      answer: "You can add family members by going to the Family page and clicking on the '+' button. From there, you can send an invitation to your family members via email."
    },
    {
      question: "Why can't I see my family member's location?",
      answer: "There could be several reasons: 1) The family member hasn't accepted your invitation yet, 2) Their location sharing settings are turned off, 3) Their device has lost connection. Try asking them to check their settings and ensure they have a good internet connection."
    },
    {
      question: "How do I set up safe zones?",
      answer: "Go to the Family page, select a family member, and click on 'Safe Zones'. From there you can add new safe zones by selecting areas on the map and giving them names like 'Home', 'School', or 'Work'."
    },
    {
      question: "What happens during an emergency?",
      answer: "If you trigger the emergency alarm, our system will immediately notify your emergency contacts with your location. If you've enabled automatic emergency services contact, your local emergency number will be contacted as well."
    },
    {
      question: "How accurate is the location tracking?",
      answer: "Our location tracking uses GPS, Wi-Fi, and cellular data to provide the most accurate location possible, typically within 10-50 meters. Accuracy may vary based on the device and environment conditions."
    },
    {
      question: "How do I change my subscription plan?",
      answer: "You can change your subscription plan by going to Settings > Subscription. From there, you can view available plans and upgrade or downgrade as needed."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we take data security very seriously. All location data and personal information is encrypted both in transit and at rest. We never share your data with third parties without your explicit consent."
    },
    {
      question: "What should I do if I can't log in?",
      answer: "Try resetting your password by clicking the 'Forgot Password' link on the login page. If that doesn't work, create a support ticket and our team will assist you as soon as possible."
    }
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Frequently Asked Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default SupportFaq;
