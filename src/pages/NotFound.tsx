
import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';

const NotFound = () => {
  const location = useLocation();
  
  useEffect(() => {
    console.error(`404 Error: User attempted to access non-existent route: ${location.pathname}`);
  }, [location]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-muted-foreground mb-6">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="space-y-4">
        <p>Looking for one of these?</p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Link to="/" className="text-primary hover:underline">Home</Link>
          <Link to="/dashboard" className="text-primary hover:underline">Dashboard</Link>
          <Link to="/map" className="text-primary hover:underline">Travel Map</Link>
          <Link to="/profile" className="text-primary hover:underline">Profile</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
