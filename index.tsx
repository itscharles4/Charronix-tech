import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <APIProvider apiKey={(import.meta as any).env.VITE_GOOGLE_MAPS_KEY || ''}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </APIProvider>
  </React.StrictMode>
);
