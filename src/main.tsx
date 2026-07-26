import React from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import './i18n/index';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-center" richColors />
  </React.StrictMode>
);
