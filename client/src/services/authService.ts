import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Configurar axios con interceptores
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor para agregar token a las requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Variable para evitar múltiples refreshes simultáneos
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Interceptor para manejar tokens expirados
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si ya está refrescando, agregar a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/api/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, token } = response.data;
          const newToken = accessToken || token;
          localStorage.setItem('token', newToken);

          processQueue(null, newToken);
          
          // Reintentar la request original
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          // Refresh token inválido, redirigir al login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/';
        } finally {
          isRefreshing = false;
        }
      } else {
        isRefreshing = false;
        // No hay refresh token, redirigir al login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

interface LoginResponse {
  message: string;
  token?: string;
  accessToken?: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    profile?: {
      name: string;
      permissions: string[];
    };
  };
}

interface VerifyResponse {
  valid: boolean;
  user: {
    id: string;
    username: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    profile?: {
      name: string;
      permissions: string[];
    };
  };
}

export const authService = {
  // Login
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/api/auth/login', {
      username,
      password,
    });
    return response.data;
  },

  // Logout
  async logout(): Promise<void> {
    await api.post('/api/auth/logout');
  },

  // Verificar token
  async verifyToken(): Promise<VerifyResponse> {
    const response = await api.get('/api/auth/me');
    return {
      valid: true,
      user: response.data.user
    };
  },

  // Refresh token
  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    const response = await api.post('/api/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  // Registro (si se habilita)
  async register(userData: {
    username: string;
    password: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<any> {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },
};

export default api; 