
import { useState, useEffect } from 'react';

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check initially
    checkIsMobile();

    // Add event listener for resize
    window.addEventListener('resize', checkIsMobile);

    // Clean up
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return isMobile;
};

export default useIsMobile;
