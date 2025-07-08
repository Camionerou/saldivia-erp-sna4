'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/services/authService';

interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  active: boolean;
  lastLogin?: string;
  createdAt: string;
  profile?: {
    id: string;
    name: string;
    permissions: string[];
    profileImage?: string;
    phone?: string;
    department?: string;
    position?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserProfile: (profileData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        return;
      }

      const response = await api.get('/api/auth/me');
      const userData = response.data.user;
      
      // Agregar timestamp a la imagen de perfil para evitar cache
      if (userData.profile?.profileImage) {
        let imageUrl = userData.profile.profileImage;
        
        // Si no es una URL completa, construir la URL base
        if (!imageUrl.startsWith('http')) {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          imageUrl = `${baseUrl}${imageUrl}`;
        }
        
        // Limpiar timestamps existentes antes de agregar uno nuevo
        imageUrl = imageUrl.split('?t=')[0];
        userData.profile.profileImage = `${imageUrl}?t=${Date.now()}`;
      }
      
      console.log('Usuario refrescado con imagen:', userData.profile?.profileImage);
      setUser(userData);
    } catch (error) {
      console.error('Error refreshing user:', error);
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const updateUserProfile = (profileData: Partial<User>) => {
    setUser(currentUser => {
      if (!currentUser) return null;
      
      const updatedUser = {
        ...currentUser,
        ...profileData
      };
      
      // Si hay una nueva imagen de perfil, agregar timestamp y URL completa
      if (profileData.profile?.profileImage) {
        let imageUrl = profileData.profile.profileImage;
        
        // Si no es una URL completa, construir la URL base
        if (!imageUrl.startsWith('http')) {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          imageUrl = `${baseUrl}${imageUrl}`;
        }
        
        // Limpiar timestamps existentes antes de agregar uno nuevo
        imageUrl = imageUrl.split('?t=')[0];
        
        updatedUser.profile = {
          ...currentUser.profile,
          ...profileData.profile,
          profileImage: `${imageUrl}?t=${Date.now()}`
        };
      }
      
      console.log('Perfil de usuario actualizado:', updatedUser.profile?.profileImage);
      return updatedUser;
    });
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        await refreshUser();
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', { username, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error de autenticación');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}; 