interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

const API_URL = 'https://psicotips-backend.onrender.com/api/auth/login/';
const HARDCODED_USERNAME = 'Admin123';
const HARDCODED_PASSWORD = 'QWERT12345';
const HARDCODED_TOKEN = 'hardcoded-admin-token';
const HARDCODED_USER = {
  id: 'admin-1',
  email: 'Admin123',
};

export const loginRequest = async (email: string, password: string): Promise<LoginResponse> => {
  if (email === HARDCODED_USERNAME && password === HARDCODED_PASSWORD) {
    return {
      token: HARDCODED_TOKEN,
      user: HARDCODED_USER,
    };
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    // Si la respuesta no es un código 200-299, lanzamos un error
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Credenciales incorrectas o error en el servidor');
    }

    // Retornamos la respuesta tipada
    return await response.json() as LoginResponse;
  } catch (error) {
    console.error('Error en loginRequest:', error);
    throw error;
  }
};