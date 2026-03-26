import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import App from './App.tsx';
import { ErrorBoundary } from './ErrorBoundary.tsx';
import { validateEnv } from './lib/env';
import './index.css';

validateEnv();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <Toaster theme="dark" position="top-right" richColors />
    </ErrorBoundary>
  </StrictMode>,
);
