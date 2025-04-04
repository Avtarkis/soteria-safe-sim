
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add an error boundary component to prevent entire app from crashing
const ErrorFallback = () => (
  <div style="padding: 20px; text-align: center; font-family: system-ui, sans-serif;">
    <h1>Something went wrong</h1>
    <p>The application encountered an error. Please refresh the page or try again later.</p>
    <button 
      onClick={() => window.location.reload()} 
      style="padding: 8px 16px; margin-top: 16px; cursor: pointer; background-color: #4F46E5; color: white; border: none; border-radius: 4px;"
    >
      Refresh Page
    </button>
  </div>
);

// Handle uncaught errors at the window level
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  
  // Prevent white screen by showing fallback UI
  const rootElement = document.getElementById("root");
  if (rootElement && event.error && event.error.toString().includes('Maximum update depth exceeded')) {
    console.error('Detected infinite re-render loop, displaying fallback UI');
    rootElement.innerHTML = ErrorFallback().outerHTML;
  }
});

// Wrap rendering in a try-catch to prevent fatal errors from causing white screens
try {
  const root = createRoot(document.getElementById("root")!);
  
  // Add an error event listener to the root to catch render errors
  root.render(<App />);
} catch (error) {
  console.error("Fatal error rendering application:", error);
  // Display a fallback UI when the app fails to render
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = ErrorFallback().outerHTML;
  }
}
