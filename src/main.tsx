import React from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'sonner';
import './i18n/index';
import './index.css';
import App from './App';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
      <Toaster position="top-center" richColors />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
