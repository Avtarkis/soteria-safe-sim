
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from '@/contexts/AuthContext';

// Define a basic ErrorBoundary component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error("Error caught by error boundary:", error);
    return { hasError: true, error };
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
          {this.state.error && (
            <div style={{ margin: '20px 0', padding: '10px', background: '#f8f8f8', borderRadius: '4px', textAlign: 'left', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>Error details:</p>
              <p style={{ margin: 0, fontSize: '14px', color: '#e53e3e', wordBreak: 'break-word' }}>{this.state.error.toString()}</p>
            </div>
          )}
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
const renderFallbackUI = (error?: Error) => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: system-ui, sans-serif">
        <h1>Something went wrong</h1>
        <p>The application encountered an error. Please refresh the page or try again later.</p>
        ${error ? `
          <div style="margin: 20px 0; padding: 10px; background: #f8f8f8; border-radius: 4px; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto">
            <p style="font-weight: bold; margin: 0 0 5px 0">Error details:</p>
            <p style="margin: 0; font-size: 14px; color: #e53e3e; word-break: break-word">${error.toString()}</p>
          </div>
        ` : ''}
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

// Global error handler for unhandled errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  
  // Create a more detailed error message
  const errorMessage = event.error ? event.error.toString() : 'Unknown error';
  console.error(`Error details: ${errorMessage}`);
  
  // Check if the error is a loading error or other fatal error
  const isFatalError = 
    event.error && (
      (typeof event.error.toString === 'function' && event.error.toString().includes('Failed to load')) ||
      event.error.message?.includes('Failed to load') ||
      event.error.message?.includes('undefined is not an object') ||
      event.error.message?.includes('null is not an object')
    );
  
  if (isFatalError) {
    console.error('Fatal error detected, showing fallback UI:', event.error);
    renderFallbackUI(event.error);
  }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  
  // Show fallback UI for critical promise rejections
  if (event.reason && 
      (event.reason.message?.includes('Failed to load') || 
       event.reason.message?.includes('Network Error'))) {
    renderFallbackUI(event.reason);
  }
});

// Wrap rendering in a try-catch to prevent white screens
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  const root = createRoot(rootElement);
  
  // Wrap the App component in the ErrorBoundary, AuthProvider, and BrowserRouter
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (error) {
  console.error("Fatal error rendering application:", error);
  renderFallbackUI(error instanceof Error ? error : new Error(String(error)));
}
