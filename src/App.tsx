
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '@/components/Dashboard';
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
import { AuthProvider } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layouts/DashboardLayout';

// Create empty placeholder pages for the missing routes
const FamilyPage = () => <div className="container mt-8"><h1 className="text-2xl font-bold mb-4">Family Safety</h1><p>Family safety features are coming soon.</p></div>;
const CyberSecurityPage = () => <div className="container mt-8"><h1 className="text-2xl font-bold mb-4">Cyber Security</h1><p>Cyber security features are coming soon.</p></div>;
const SubscriptionPage = () => <div className="container mt-8"><h1 className="text-2xl font-bold mb-4">Subscription Management</h1><p>Subscription management features are coming soon.</p></div>;

function App() {
  // Expose isUsingFallbackValues to window
  useEffect(() => {
    // Make the function available to the window object for scripts in index.html
    window.isUsingFallbackValues = isUsingFallbackValues;
    
    // Show warning if using fallback values
    if (isUsingFallbackValues()) {
      console.warn("Using fallback Supabase credentials. Consider setting proper environment variables.");
    }
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="soteria-theme">
      <AuthProvider>
        <Router>
          <Routes>
            {/* Main dashboard layout with nested routes */}
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/map" element={<ThreatsMap />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/emergency" element={<EmergencyPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/travel" element={<TravelPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              
              {/* Add missing routes */}
              <Route path="/family" element={<FamilyPage />} />
              <Route path="/cyber" element={<CyberSecurityPage />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
            </Route>

            {/* Fallback route for 404 errors */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
                <p className="mb-4">The page you are looking for doesn't exist or has been moved.</p>
                <a href="/" className="px-4 py-2 bg-primary text-white rounded-md">
                  Return to Dashboard
                </a>
              </div>
            } />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
