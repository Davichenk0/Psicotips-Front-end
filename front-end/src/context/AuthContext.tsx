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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  
  useEffect(() => {
    const storedToken = localStorage.getItem('psicotips_token');
    const storedUser = localStorage.getItem('psicotips_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  
  const login = (newToken: string, userData: User) => {
    localStorage.setItem('psicotips_token', newToken);
    localStorage.setItem('psicotips_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  
  const logout = () => {
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
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};