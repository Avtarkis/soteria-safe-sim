
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AuthScreen from '@/components/AuthScreen';
import Dashboard from '@/components/Dashboard';
import ThreatsMap from '@/components/ThreatsMap';
import EmergencyResponse from '@/components/EmergencyResponse';
import CyberSecurity from '@/components/CyberSecurity';
import Subscription from '@/components/Subscription';
import FamilyMonitoring from '@/components/family/FamilyMonitoring';
import NotFound from '@/pages/NotFound';
import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<AuthScreen />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="map" element={<ProtectedRoute><ThreatsMap /></ProtectedRoute>} />
              <Route path="emergency" element={<ProtectedRoute><EmergencyResponse /></ProtectedRoute>} />
              <Route path="cyber" element={<ProtectedRoute><CyberSecurity /></ProtectedRoute>} />
              <Route path="subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
              <Route path="family" element={<ProtectedRoute><FamilyMonitoring /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
