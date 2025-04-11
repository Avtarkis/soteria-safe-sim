
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/SignupPage';
import ProfilePage from '@/pages/ProfilePage';
import TravelPage from '@/pages/TravelPage';
import AlertsPage from '@/pages/AlertsPage';
import EmergencyPage from '@/pages/EmergencyPage';
import CyberSecurityPage from '@/pages/CyberSecurityPage';
import FamilyPage from '@/pages/FamilyPage';
import SubscriptionPage from '@/pages/SubscriptionPage';
import NotFoundPage from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import AdminUsersPage from '@/pages/AdminUsersPage';
import AdminThreatsPage from '@/pages/AdminThreatsPage';
import ThreatsMap from '@/components/ThreatsMap';
import Dashboard from '@/components/Dashboard';
import SettingsPage from '@/pages/SettingsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Redirect home to dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Auth routes */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        
        {/* Protected routes */}
        <Route path="profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
        <Route path="map" element={
          <ProtectedRoute>
            <ThreatsMap />
          </ProtectedRoute>
        } />
        <Route path="dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="alerts" element={
          <ProtectedRoute>
            <AlertsPage />
          </ProtectedRoute>
        } />
        <Route path="emergency" element={
          <ProtectedRoute>
            <EmergencyPage />
          </ProtectedRoute>
        } />
        <Route path="travel" element={
          <ProtectedRoute>
            <TravelPage />
          </ProtectedRoute>
        } />
        <Route path="family" element={
          <ProtectedRoute>
            <FamilyPage />
          </ProtectedRoute>
        } />
        <Route path="cyber" element={
          <ProtectedRoute>
            <CyberSecurityPage />
          </ProtectedRoute>
        } />
        <Route path="subscription" element={
          <ProtectedRoute>
            <SubscriptionPage />
          </ProtectedRoute>
        } />
        
        {/* Admin routes */}
        <Route path="admin" element={
          <ProtectedRoute>
            <AdminDashboardPage />
          </ProtectedRoute>
        } />
        <Route path="admin/users" element={
          <ProtectedRoute>
            <AdminUsersPage />
          </ProtectedRoute>
        } />
        <Route path="admin/threats" element={
          <ProtectedRoute>
            <AdminThreatsPage />
          </ProtectedRoute>
        } />
        
        {/* Not found */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
