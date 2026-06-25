import React, { createContext, useContext, useState, useEffect } from 'react';


interface User {
  id: string;
  email: string;
}


interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Restaurar las credenciales persistidas una sola vez para que el refresco no rompa la sesión.
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  
  useEffect(() => {
    // localStorage actúa como capa de persistencia para esta demo del lado del cliente.
    const storedToken = localStorage.getItem('psicotips_token');
    const storedUser = localStorage.getItem('psicotips_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  
  const login = (newToken: string, userData: User) => {
    // Mantener sincronizados el estado y la persistencia después de un inicio de sesión exitoso.
    localStorage.setItem('psicotips_token', newToken);
    localStorage.setItem('psicotips_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  
  const logout = () => {
    // Limpiar todas las credenciales guardadas para cerrar la sesión por completo.
    localStorage.removeItem('psicotips_token');
    localStorage.removeItem('psicotips_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Este hook solo es seguro dentro del árbol del proveedor.
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};