import React from 'react';
import { LoginForm } from './components/LoginForm';
import { useAuth } from './context/AuthContext';
import { Dashboard } from './components/Dashboard';

function App() {
  const { user } = useAuth();

  return (
    <div className="App">
      {/* Mostrar el dashboard solo cuando la autenticación ya tenga una sesión activa. */}
      {user ? (
        <Dashboard />
      ) : (
        <LoginForm />
      )}
    </div>
  );
}

export default App;