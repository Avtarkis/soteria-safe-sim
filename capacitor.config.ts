
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.3b89fbb72fdc40cb9cf631803e169841',
  appName: 'soteria-safe-sim',
  webDir: 'dist',
  server: {
    url: 'https://3b89fbb7-2fdc-40cb-9cf6-31803e169841.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    // We'll add plugins here as needed
  }
};

export default config;
