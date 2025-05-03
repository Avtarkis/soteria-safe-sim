
import React from 'react';

interface CurrencySelectorProps {
  currency: 'usd' | 'ngn';
  country?: string;
  isLoading: boolean;
  attemptCurrencyChange: (currency: 'usd' | 'ngn') => void;
}

const CurrencySelector = ({ 
  currency, 
  country, 
  isLoading, 
  attemptCurrencyChange 
}: CurrencySelectorProps) => {
  
  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="flex justify-center mb-6">
      <div className="bg-secondary text-secondary-foreground rounded-lg px-4 py-2 inline-flex items-center">
        <span className="mr-2">Currency:</span>
        <div className="flex border rounded-md">
          <button
            onClick={() => attemptCurrencyChange('usd')}
            className={`px-3 py-1 ${
              currency === 'usd' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-transparent'
            } rounded-l-md transition-colors`}
            disabled={country !== 'United States of America'}
          >
            USD ($)
          </button>
          <button
            onClick={() => attemptCurrencyChange('ngn')}
            className={`px-3 py-1 ${
              currency === 'ngn' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-transparent'
            } rounded-r-md transition-colors`}
            disabled={country !== 'Nigeria'}
          >
            NGN (₦)
          </button>
        </div>
        {country && (
          <span className="ml-3 text-sm">
            Detected location: <strong>{country}</strong>
          </span>
        )}
      </div>
    </div>
  );
};

export default CurrencySelector;
