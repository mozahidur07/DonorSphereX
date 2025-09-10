
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import './utils/api'; // Import the API setup

// Handle redirects for client-side routing in production
const handleRouting = () => {
  // First check for redirect query param (from 404.html)
  const query = new URLSearchParams(window.location.search);
  const redirectPath = query.get('redirect');
  
  if (redirectPath) {
    // Remove the query parameter and set the correct path
    window.history.replaceState(null, null, redirectPath);
    return;
  }
  
  // Then check for stored path from direct access (from index.html script)
  try {
    const storedPath = sessionStorage.getItem('redirectPath');
    if (storedPath) {
      sessionStorage.removeItem('redirectPath');
      // Only redirect if we're currently at the root
      if (window.location.pathname === '/') {
        window.history.replaceState(null, null, storedPath);
      }
    }
  } catch (e) {
    console.error('Failed to process stored redirect path:', e);
  }
};

// Apply routing fixes
handleRouting();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
