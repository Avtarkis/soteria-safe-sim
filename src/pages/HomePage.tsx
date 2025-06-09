
import React from 'react';
import { Navigate } from 'react-router-dom';

const HomePage = () => {
  // Redirect to dashboard
  return <Navigate to="/dashboard" replace />;
};

export default HomePage;
