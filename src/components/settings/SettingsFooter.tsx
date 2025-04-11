
import React from 'react';

const SettingsFooter = () => {
  return (
    <div className="text-center text-sm text-muted-foreground pb-8">
      <p>Soteria Security App • Version 1.0.4</p>
      <div className="flex items-center justify-center gap-4 mt-2">
        <a href="#" className="hover:underline">Terms of Service</a>
        <a href="#" className="hover:underline">Privacy Policy</a>
        <a href="#" className="hover:underline">Help Center</a>
      </div>
    </div>
  );
};

export default SettingsFooter;
