
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layouts/Navbar';
import HomePage from '@/pages/HomePage';
import DashboardPage from '@/pages/Index';
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        
        {/* Protected routes */}
        <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="map" element={<ProtectedRoute><TravelPage /></ProtectedRoute>} />
        <Route path="alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
        <Route path="emergency" element={<ProtectedRoute><EmergencyPage /></ProtectedRoute>} />
        <Route path="travel" element={<ProtectedRoute><TravelPage /></ProtectedRoute>} />
        <Route path="family" element={<ProtectedRoute><FamilyPage /></ProtectedRoute>} />
        <Route path="cyber" element={<ProtectedRoute><CyberSecurityPage /></ProtectedRoute>} />
        <Route path="subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
        
        {/* Admin routes */}
        <Route path="admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="admin/users" element={<ProtectedRoute><AdminUsersPage /></ProtectedRoute>} />
        <Route path="admin/threats" element={<ProtectedRoute><AdminThreatsPage /></ProtectedRoute>} />
        
        {/* Not found */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
