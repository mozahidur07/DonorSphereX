
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import './utils/api'; // Import the API setup

// Handle redirects for client-side routing in production
const redirectFromQuery = () => {
  const query = new URLSearchParams(window.location.search);
  const redirectPath = query.get('redirect');
  
  if (redirectPath) {
    // Remove the query parameter
    window.history.replaceState(null, null, redirectPath);
  }
};

// Apply the redirect if needed
redirectFromQuery();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
