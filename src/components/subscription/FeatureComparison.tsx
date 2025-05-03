
import React from 'react';
import { Check } from 'lucide-react';

interface Feature {
  id: string;
  name: string;
  premium: string | boolean;
  family: string | boolean;
}

interface FeatureComparisonProps {
  features: Feature[];
}

const Cross = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6L6 18"></path>
    <path d="M6 6l12 12"></path>
  </svg>
);

const FeatureComparison = ({ features }: FeatureComparisonProps) => {
  return (
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
  );
};

export default FeatureComparison;
