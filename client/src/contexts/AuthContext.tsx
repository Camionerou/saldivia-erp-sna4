'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profile?: {
    name: string;
    permissions: string[];
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  token: null,
  loading: true,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Verificando token:', token ? 'existe' : 'no existe');
        
        if (token) {
          try {
            const response = await authService.verifyToken();
            console.log('Respuesta de verificación:', response);
            
            if (response.valid && response.user) {
              dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user: response.user, token },
              });
              console.log('Token válido, usuario autenticado:', response.user);
            } else {
              console.log('Token inválido, limpiando localStorage');
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              dispatch({ type: 'LOGOUT' });
            }
          } catch (error) {
            console.error('Error verificando token:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } else {
          console.log('No hay token, usuario no autenticado');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Error en checkAuth:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    // Agregar un pequeño delay para evitar problemas de SSR
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, []);

  const login = async (username: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      console.log('Iniciando login para:', username);
      const response = await authService.login(username, password);
      console.log('Respuesta del login:', response);
      
      // Guardar tokens en localStorage
      const token = response.accessToken || response.token;
      if (!token) {
        throw new Error('No se recibió token del servidor');
      }
      
      localStorage.setItem('token', token);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: response.user, token },
      });
      
      console.log('Login exitoso, usuario:', response.user);
      const welcomeName = response.user.firstName || response.user.username || 'Usuario';
      toast.success(`¡Bienvenido, ${welcomeName}!`);
    } catch (error: any) {
      console.error('Error en login:', error);
      const errorMessage = error.response?.data?.error || 'Error de autenticación';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignorar errores de logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      dispatch({ type: 'LOGOUT' });
      toast.success('Sesión cerrada correctamente');
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 