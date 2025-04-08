
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Index from '@/pages/Index';
import ThreatsMap from '@/components/ThreatsMap';
import NotFound from '@/pages/NotFound';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/ThemeProvider';
import { isUsingFallbackValues } from '@/lib/supabase';

function App() {
  // Expose isUsingFallbackValues to window
  useEffect(() => {
    // Make the function available to the window object for scripts in index.html
    (window as any).isUsingFallbackValues = isUsingFallbackValues;
    
    // Show warning if using fallback values
    if (isUsingFallbackValues()) {
      console.warn("Using fallback Supabase credentials. Consider setting proper environment variables.");
    }
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="soteria-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="/map" element={<ThreatsMap />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;
