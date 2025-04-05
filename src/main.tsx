
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Define a basic ErrorBoundary component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("React error boundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
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
    }

    return this.props.children;
  }
}

// Simple fallback UI function
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

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  
  // Only show fallback UI for fatal errors
  if (event.error && event.error.toString().includes('Failed to load chunk')) {
    console.error('Fatal chunk loading error detected, showing fallback UI');
    renderFallbackUI();
  }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
});

// Wrap rendering in a try-catch to prevent white screens
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("Root element not found");
  
  const root = createRoot(rootElement);
  
  // Wrap the App component in the ErrorBoundary
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (error) {
  console.error("Fatal error rendering application:", error);
  renderFallbackUI();
}
