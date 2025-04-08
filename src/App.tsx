
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import HomePage from '@/pages/HomePage';
import ThreatsMap from '@/components/ThreatsMap';
import AlertsPage from '@/pages/AlertsPage';
import EmergencyPage from '@/pages/EmergencyPage';
import SettingsPage from '@/pages/SettingsPage';
import TravelPage from '@/pages/TravelPage';
import ProfilePage from '@/pages/ProfilePage';
import NotificationsPage from '@/pages/NotificationsPage';
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
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/map" element={<ThreatsMap />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/emergency" element={<EmergencyPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/travel" element={<TravelPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;
