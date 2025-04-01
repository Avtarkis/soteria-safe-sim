
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Wrap rendering in a try-catch to prevent fatal errors from causing white screens
try {
  createRoot(document.getElementById("root")!).render(<App />);
} catch (error) {
  console.error("Fatal error rendering application:", error);
  // Display a fallback UI when the app fails to render
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: system-ui, sans-serif;">
        <h1>Something went wrong</h1>
        <p>The application encountered an error. Please refresh the page or try again later.</p>
        <button onclick="window.location.reload()" style="padding: 8px 16px; margin-top: 16px; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    `;
  }
}
