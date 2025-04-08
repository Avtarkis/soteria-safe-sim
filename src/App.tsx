
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';

// Layout
import Layout from '@/components/layout/Layout';

// Pages
import HomePage from '@/pages/HomePage';
import ThreatsMap from '@/components/ThreatsMap';
import TravelPage from '@/pages/TravelPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="secure-travel-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="/map" element={<ThreatsMap />} />
              <Route path="/travel" element={<TravelPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
