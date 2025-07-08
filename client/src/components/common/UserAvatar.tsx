import React, { useState, useEffect } from 'react';
import { Avatar, AvatarProps } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';

interface UserAvatarProps extends Omit<AvatarProps, 'src'> {
  src?: string | null;
  firstName?: string;
  lastName?: string;
  username?: string;
  size?: number;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  firstName = '',
  lastName = '',
  username = '',
  size = 40,
  sx,
  ...props
}) => {
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [temporaryImage, setTemporaryImage] = useState<string | null>(null);
  
  // Resetear el error cuando cambie el src
  useEffect(() => {
    setImageError(false);
  }, [src]);

  // Cargar imagen actual como temporal para el usuario logueado
  useEffect(() => {
    const loadCurrentImageAsTemporary = async () => {
      // Solo para el usuario actual logueado
      if (user && src && src.includes(user.id)) {
        try {
          let imageUrl = src;
          
          // Si no es una URL completa, construir la URL base
          if (!imageUrl.startsWith('http')) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            imageUrl = `${baseUrl}${imageUrl}`;
          }
          
          // Agregar timestamp para evitar cache
          const timestampedUrl = `${imageUrl}?t=${Date.now()}`;
          
          // Descargar imagen y convertir a base64
          const response = await fetch(timestampedUrl);
          if (response.ok) {
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onloadend = () => {
              setTemporaryImage(reader.result as string);
            };
            reader.readAsDataURL(blob);
          }
        } catch (error) {
          console.error('Error cargando imagen temporal:', error);
        }
      }
    };

    loadCurrentImageAsTemporary();
  }, [src, user]);
  
  // Escuchar eventos de actualización de imagen de perfil
  useEffect(() => {
    const handleProfileImageUpdate = () => {
      setImageError(false);
      // Forzar re-render
      setTimeout(() => {
        setImageError(false);
      }, 100);
    };
    
    window.addEventListener('profileImageUpdated', handleProfileImageUpdate);
    return () => {
      window.removeEventListener('profileImageUpdated', handleProfileImageUpdate);
    };
  }, []);

  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (username) {
      return username.charAt(0).toUpperCase();
    }
    return '?';
  };

  const getImageUrl = () => {
    // PRIORIDAD 1: Imagen temporal (para usuario logueado)
    if (temporaryImage && user && src && src.includes(user.id)) {
      return temporaryImage;
    }
    
    // PRIORIDAD 2: Imagen original con cache busting
    if (!src || imageError) return undefined;
    
    let imageUrl = src;
    
    // Si no es una URL completa, construir la URL base
    if (!imageUrl.startsWith('http')) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      imageUrl = `${baseUrl}${imageUrl}`;
    }
    
    // SOLUCIÓN BRUTAL: SIEMPRE agregar timestamp único
    imageUrl = imageUrl.split('?t=')[0]; // Limpiar timestamps existentes
    return `${imageUrl}?t=${Date.now()}&nocache=${Math.random()}`;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Avatar
      src={getImageUrl()}
      onError={handleImageError}
      key={`${src}-${temporaryImage}`} // Forzar re-render cuando cambie cualquiera
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        bgcolor: 'primary.main',
        ...sx
      }}
      {...props}
    >
      {getInitials()}
    </Avatar>
  );
};

export default UserAvatar; 