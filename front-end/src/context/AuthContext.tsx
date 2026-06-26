import React, { createContext, useContext, useState, useEffect } from 'react';

// Definición de la estructura del usuario autenticado, incluyendo su ID y correo electrónico.
interface User {
  id: string;
  email: string;
}

// Definición de la estructura del contexto de autenticación, incluyendo el usuario, token y funciones de login/logout.
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  loading: boolean;
}

// Crear un contexto de autenticación con un valor inicial indefinido.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor de contexto que envuelve la aplicación y maneja el estado de autenticación.
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Restaurar las credenciales persistidas una sola vez para que el refresco no rompa la sesión.
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  
  useEffect(() => {
    // localStorage actúa como capa de persistencia para esta demo del lado del cliente.
    const storedToken = localStorage.getItem('psicotips_token');
    const storedUser = localStorage.getItem('psicotips_user');

    // Si existen credenciales guardadas, restaurarlas en el estado del contexto.
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // La función de inicio de sesión actualiza tanto el estado como la persistencia local.
  const login = (newToken: string, userData: User) => {
    // Mantener sincronizados el estado y la persistencia después de un inicio de sesión exitoso.
    localStorage.setItem('psicotips_token', newToken);
    localStorage.setItem('psicotips_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  // La función de cierre de sesión limpia el estado y la persistencia para cerrar la sesión del usuario.
  const logout = () => {
    // Limpiar todas las credenciales guardadas para cerrar la sesión por completo.
    localStorage.removeItem('psicotips_token');
    localStorage.removeItem('psicotips_user');
    setToken(null);
    setUser(null);
  };

  // Proporcionar el estado y las funciones de autenticación a los componentes hijos a través del contexto.
  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para acceder al contexto de autenticación de manera segura.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Este hook solo es seguro dentro del árbol del proveedor.
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};