import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const storedToken = localStorage.getItem('psicotips_token');
		const storedUser = localStorage.getItem('psicotips_user');

		if (storedToken && storedUser) {
			setToken(storedToken);
			setUser(JSON.parse(storedUser));
		}
		setLoading(false);
	}, []);

	const login = (newToken, userData) => {
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
	if (!context) throw new Error('useAuth debe ser usado dentro de un AuthProvider');
	return context;
};

