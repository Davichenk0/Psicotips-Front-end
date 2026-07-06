import React, { useState } from 'react';
import { loginRequest } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import logoPsicotips from '../assets/Logo.png';

export const LoginForm: React.FC = () => {                 // Componente funcional que representa el formulario de inicio de sesión.
  const { login } = useAuth();                             // Hook personalizado para acceder a la función de inicio de sesión del contexto de autenticación.
  const [email, setEmail] = useState<string>('');          // Estado local para almacenar el correo electrónico ingresado por el usuario.
  const [password, setPassword] = useState<string>('');    // Estado local para almacenar la contraseña ingresada por el usuario.
  const [error, setError] = useState<string | null>(null); // Estado local para almacenar mensajes de error relacionados con el inicio de sesión.
  const [loading, setLoading] = useState<boolean>(false);  // Estado local para indicar si la solicitud de inicio de sesión está en curso.

  // El manejador de envío controla la validación, el estado de carga y el traspaso a autenticación.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();  // Prevenir el comportamiento por defecto del formulario para evitar recargas de página.
    setError(null);
    setLoading(true);

    try {
      // Delegar la validación de credenciales a la capa de servicios.
      const data = await loginRequest(email, password);
      
      // Persistir el usuario autenticado en el estado global.
      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Iniciar Sesión en Psicotips</h2>

      {/* Logo centrado sobre el formulario para anclar visualmente la pantalla de acceso. */}
    <img 
      src={logoPsicotips} alt="Logo Psicotips" style={{ display: 'block', margin: '0 auto', width: '200px', height: 'auto', marginBottom: '15px' }} />
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Correo electronico:</label>
          <input
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            placeholder="correo@empresa.com"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            placeholder="QWERT12345"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        
        {/* Deshabilitar el botón mientras la petición está en curso para evitar envíos duplicados. */}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Cargando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
};