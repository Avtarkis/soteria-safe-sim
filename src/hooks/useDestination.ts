
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const useDestination = () => {
  const [destination, setDestination] = useState<string | null>(null);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const dest = searchParams.get('destination');
    if (dest) {
      setDestination(dest);
      toast({
        title: `Navigating to ${dest}`,
        description: `Showing the safest route to your ${dest} location.`,
      });
    }
  }, [location.search, toast]);

  return { destination };
};

export default useDestination;
