'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/components/auth/LoginPage';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('HomePage useEffect - user:', user, 'loading:', loading);
    if (user && !loading) {
      console.log('Redirigiendo a dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    }
  }, [user, loading, router]);

  console.log('HomePage render - user:', user, 'loading:', loading);

  if (loading) {
    return <LoadingSpinner message="Verificando autenticación..." />;
  }

  if (user) {
    return <LoadingSpinner message="Redirigiendo al dashboard..." />;
  }

  return <LoginPage />;
} 