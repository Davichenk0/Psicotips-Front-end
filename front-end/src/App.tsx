import React from 'react';
import { LoginForm } from './components/LoginForm.js';
import { useAuth } from './context/AuthContext.js';

function App() {
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

export default App;