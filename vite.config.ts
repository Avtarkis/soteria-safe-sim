
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Supabase credentials directly set here for production
const supabaseUrl = 'https://momujszivwegjajwzngy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXVqc3ppdndlZ2phand6bmd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMTgyMTcsImV4cCI6MjA1OTY5NDIxN30.u12Ut80z2iNxmyTH2_m96lroygpARxv9s3AKjDfBLMQ';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  // Set base path to ensure assets load correctly in production
  base: '/',
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Ensure proper build options for production deployments
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: true,
    chunkSizeWarningLimit: 1000,
  },
  // Define global environment variables with hardcoded values
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
  },
}));
