
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
import FamilyInvitePage from '@/pages/FamilyInvitePage';
import SubscriptionPage from '@/pages/SubscriptionPage';
import SubscribeRequiredPage from '@/pages/SubscribeRequiredPage';
import NotFoundPage from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import AdminUsersPage from '@/pages/AdminUsersPage';
import AdminThreatsPage from '@/pages/AdminThreatsPage';
import AdminSupportPage from '@/pages/AdminSupportPage';
import AdminTicketDetailPage from '@/pages/AdminTicketDetailPage';
import AdminSettingsPage from '@/pages/AdminSettingsPage';
import SupportPage from '@/pages/SupportPage';
import TicketDetailPage from '@/pages/TicketDetailPage';
import ThreatsMap from '@/components/ThreatsMap';
import Dashboard from '@/components/Dashboard';
import SettingsPage from '@/pages/SettingsPage';
import { isStoreApp } from '@/utils/platformUtils';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Redirect home to dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Auth routes */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        
        {/* Subscription required page for store apps */}
        <Route path="subscribe-required" element={<SubscribeRequiredPage />} />
        
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
        <Route path="family/invite" element={
          <ProtectedRoute>
            <FamilyInvitePage />
          </ProtectedRoute>
        } />
        <Route path="cyber" element={
          <ProtectedRoute>
            <CyberSecurityPage />
          </ProtectedRoute>
        } />
        
        {/* Subscription page - only available on web */}
        <Route path="subscription" element={
          !isStoreApp() ? (
            <ProtectedRoute>
              <SubscriptionPage />
            </ProtectedRoute>
          ) : (
            <Navigate to="/dashboard" replace />
          )
        } />
        
        {/* Support routes */}
        <Route path="support" element={
          <ProtectedRoute>
            <SupportPage />
          </ProtectedRoute>
        } />
        <Route path="support/ticket/:ticketId" element={
          <ProtectedRoute>
            <TicketDetailPage />
          </ProtectedRoute>
        } />
        
        {/* Admin routes - use AdminProtectedRoute */}
        <Route path="admin" element={
          <AdminProtectedRoute>
            <AdminDashboardPage />
          </AdminProtectedRoute>
        } />
        <Route path="admin/users" element={
          <AdminProtectedRoute>
            <AdminUsersPage />
          </AdminProtectedRoute>
        } />
        <Route path="admin/threats" element={
          <AdminProtectedRoute>
            <AdminThreatsPage />
          </AdminProtectedRoute>
        } />
        <Route path="admin/support" element={
          <AdminProtectedRoute>
            <AdminSupportPage />
          </AdminProtectedRoute>
        } />
        <Route path="admin/support/ticket/:ticketId" element={
          <AdminProtectedRoute>
            <AdminTicketDetailPage />
          </AdminProtectedRoute>
        } />
        <Route path="admin/settings" element={
          <AdminProtectedRoute>
            <AdminSettingsPage />
          </AdminProtectedRoute>
        } />
        
        {/* Not found */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
