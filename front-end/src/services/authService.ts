interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

interface LoginApiResponse {
  token?: string;
  access?: string;
  key?: string;
  user?: {
    id?: string | number;
    pk?: string | number;
    email?: string;
    username?: string;
  };
}

interface UserApiResponse {
  id?: string | number;
  pk?: string | number;
  email?: string;
  username?: string;
}

const API_BASE_URL = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
const LOGIN_URL = `${API_BASE_URL}/api/auth/login/`;
const USER_URL = `${API_BASE_URL}/api/auth/user/`;

const normalizeUser = (payload: LoginApiResponse['user'] | UserApiResponse | undefined, fallbackEmail: string) => ({
  id: String(payload?.id ?? payload?.pk ?? fallbackEmail),
  email: payload?.email || payload?.username || fallbackEmail,
});

const getUserDetails = async (token: string, fallbackEmail: string) => {
  try {
    const response = await fetch(USER_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return normalizeUser(undefined, fallbackEmail);
    }

    const userPayload = await response.json() as UserApiResponse;
    return normalizeUser(userPayload, fallbackEmail);
  } catch {
    return normalizeUser(undefined, fallbackEmail);
  }
};

export const loginRequest = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await fetch(LOGIN_URL, {
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

    const payload = await response.json() as LoginApiResponse;
    const token = payload.token || payload.access || payload.key;

    if (!token) {
      throw new Error('La respuesta del servidor no incluyo un token de autenticacion');
    }

    const user = payload.user
      ? normalizeUser(payload.user, email)
      : await getUserDetails(token, email);

    return {
      token,
      user,
    };
  } catch (error) {
    console.error('Error en loginRequest:', error);
    throw error;
  }
};