import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Suppress benign internal Monaco Editor cancellation noise on touch / rapid event dispatch
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = function (...args) {
    const first = args[0];
    if (
      typeof first === 'string' &&
      (first.includes('ERR Canceled') ||
       first.includes('Canceled: Canceled') ||
       first.includes('Cannot read properties of undefined (reading \'startTime\')'))
    ) {
      return; // Harmless browser/Monaco touch cancellation or tracking prevention
    }
    if (first && (first.message === 'Canceled' || first.name === 'Canceled')) {
      return;
    }
    originalConsoleError.apply(console, args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = reason?.message || String(reason || '');
    if (
      msg === 'Canceled' ||
      msg.includes('Canceled') ||
      reason?.name === 'Canceled' ||
      String(reason).includes('startTime')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

