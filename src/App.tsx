
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import DashboardPage from '@/pages/Index';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/SignupPage';
import ProfilePage from '@/pages/ProfilePage';
import MapPage from '@/pages/TravelPage';
import NotFoundPage from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import AdminUsersPage from '@/pages/AdminUsersPage';
import AdminThreatsPage from '@/pages/AdminThreatsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        
        {/* Protected routes */}
        <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
        <Route path="travel" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
        
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
