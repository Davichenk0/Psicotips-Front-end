import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './App.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthContext';
import { ClientProvider } from './context/ClientContext';

// Los proveedores raíz mantienen disponibles el estado de autenticación y de clientes en toda la app.
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <ClientProvider>
        <App />
      </ClientProvider>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();