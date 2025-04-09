
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';

// Layout
import Layout from '@/components/Layout';

// Pages
import Dashboard from '@/components/Dashboard';
import ThreatsMap from '@/components/ThreatsMap';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import TravelPage from '@/pages/TravelPage';
import FamilyPage from '@/pages/FamilyPage';
import EmergencyPage from '@/pages/EmergencyPage';
import AlertsPage from '@/pages/AlertsPage';
import CyberSecurityPage from '@/pages/CyberSecurityPage';
import SubscriptionPage from '@/pages/SubscriptionPage';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="secure-travel-theme">
      <AuthProvider>
        <Router>
          <Routes>
            {/* Make login the default route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Protected routes within layout */}
            <Route path="/" element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/map" element={<ThreatsMap />} />
              <Route path="/travel" element={<TravelPage />} />
              <Route path="/family" element={<FamilyPage />} />
              <Route path="/emergency" element={<EmergencyPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/cyber" element={<CyberSecurityPage />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
