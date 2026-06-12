import React from 'react';
import LoginForm from './components/LoginForm.jsx';
import { useAuth } from './context/AuthContext.js';
import './App.css';

export default function App() {
  const { user, logout } = useAuth();

  return (
    <div className="App">
      {user ? (
        <div style={{ padding: '20px' }}>
          <h1>Bienvenido, {user.email}</h1>
          <button onClick={logout}>Cerrar Sesión</button>
        </div>
      ) : (
        <LoginForm />
      )}
    </div>
  );
}
