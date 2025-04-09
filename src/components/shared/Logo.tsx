
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <img src="/soteria-logo.png" alt="Soteria Logo" className="h-8 w-auto" />
      <span className="font-bold text-xl hidden sm:inline-block">Soteria</span>
    </Link>
  );
};

export default Logo;
