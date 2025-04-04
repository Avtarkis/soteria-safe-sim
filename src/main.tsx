
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add an error boundary component to prevent entire app from crashing
const ErrorFallback = () => (
  <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
    <h1>Something went wrong</h1>
    <p>The application encountered an error. Please refresh the page or try again later.</p>
    <button 
      onClick={() => window.location.reload()} 
      style={{ padding: '8px 16px', marginTop: '16px', cursor: 'pointer', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '4px' }}
    >
      Refresh Page
    </button>
  </div>
);

// Prevent error from causing white screen
const renderFallbackUI = () => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: system-ui, sans-serif">
        <h1>Something went wrong</h1>
        <p>The application encountered an error. Please refresh the page or try again later.</p>
        <button 
          onclick="window.location.reload()" 
          style="padding: 8px 16px; margin-top: 16px; cursor: pointer; background-color: #4F46E5; color: white; border: none; border-radius: 4px"
        >
          Refresh Page
        </button>
      </div>
    `;
    rootElement.appendChild(tempDiv);
  }
};

// Handle uncaught errors at the window level
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  
  // Prevent white screen by showing fallback UI
  if (event.error && (
    event.error.toString().includes('Maximum update depth exceeded') ||
    event.error.toString().includes('Rendered fewer hooks than expected')
  )) {
    console.error('Detected React rendering error, displaying fallback UI');
    renderFallbackUI();
  }
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  // For severe promise rejections that might break the app
  if (event.reason && (
    event.reason.toString().includes('Failed to fetch') ||
    event.reason.toString().includes('Network Error')
  )) {
    console.error('Detected network error, application might be unstable');
  }
});

// Wrap rendering in a try-catch to prevent fatal errors from causing white screens
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("Root element not found");
  
  const root = createRoot(rootElement);
  
  // Add an error event listener to the root to catch render errors
  root.render(<App />);
} catch (error) {
  console.error("Fatal error rendering application:", error);
  // Display a fallback UI when the app fails to render
  renderFallbackUI();
}
