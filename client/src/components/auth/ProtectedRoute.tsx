'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('ProtectedRoute - user:', user, 'loading:', loading);
    
    if (!loading && !user) {
      console.log('Usuario no autenticado, redirigiendo a login...');
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner message="Verificando autenticación..." />;
  }

  if (!user) {
    return <LoadingSpinner message="Redirigiendo..." />;
  }

  return <>{children}</>;
} 