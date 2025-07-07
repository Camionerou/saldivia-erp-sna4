import React from 'react';
import { Avatar } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';

interface UserAvatarProps {
  size?: number;
  sx?: any;
}

export default function UserAvatar({ size = 32, sx = {} }: UserAvatarProps) {
  const { user } = useAuth();

  const getInitials = () => {
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    const username = user?.username || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    
    return username.charAt(0).toUpperCase();
  };

  const getProfileImageUrl = () => {
    if (user?.profile && typeof user.profile === 'object' && user.profile.profileImage) {
      return `${process.env.NEXT_PUBLIC_API_URL}${user.profile.profileImage}`;
    }
    return null;
  };

  return (
    <Avatar
      sx={{ 
        width: size, 
        height: size, 
        bgcolor: 'rgba(255,255,255,0.2)',
        ...sx 
      }}
      src={getProfileImageUrl() || undefined}
    >
      {!getProfileImageUrl() && getInitials()}
    </Avatar>
  );
} 