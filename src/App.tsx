
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { AdminProvider } from '@/contexts/AdminContext';

// Layout
import Layout from '@/components/Layout';
import DashboardLayout from '@/components/layouts/DashboardLayout';

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
import NotFound from '@/pages/NotFound';
import ResetPassword from '@/pages/ResetPassword';

// Admin Pages
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import AdminUsersPage from '@/pages/AdminUsersPage';
import AdminThreatsPage from '@/pages/AdminThreatsPage';

// Protected Route Component
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="secure-travel-theme">
      <AuthProvider>
        <AdminProvider>
          <Router>
            <Routes>
              {/* Auth routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected routes within layout */}
              <Route element={<Layout />}>
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/map" 
                  element={
                    <ProtectedRoute>
                      <ThreatsMap />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/travel" 
                  element={
                    <ProtectedRoute>
                      <TravelPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/family" 
                  element={
                    <ProtectedRoute>
                      <FamilyPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/emergency" 
                  element={
                    <ProtectedRoute>
                      <EmergencyPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/alerts" 
                  element={
                    <ProtectedRoute>
                      <AlertsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/cyber" 
                  element={
                    <ProtectedRoute>
                      <CyberSecurityPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/subscription" 
                  element={
                    <ProtectedRoute>
                      <SubscriptionPage />
                    </ProtectedRoute>
                  } 
                />
              </Route>
              
              {/* Admin routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute>
                    <AdminUsersPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/threats" 
                element={
                  <ProtectedRoute>
                    <AdminThreatsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 Not Found route for all unmatched paths */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </AdminProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
