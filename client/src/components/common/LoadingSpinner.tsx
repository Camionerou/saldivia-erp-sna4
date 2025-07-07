'use client';

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { DirectionsBus } from '@mui/icons-material';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
}

export default function LoadingSpinner({ 
  message = 'Cargando...', 
  size = 40 
}: LoadingSpinnerProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        color: 'white',
      }}
    >
      <DirectionsBus sx={{ fontSize: 60, mb: 2, opacity: 0.8 }} />
      <CircularProgress 
        size={size} 
        sx={{ 
          color: 'white',
          mb: 2 
        }} 
      />
      <Typography variant="h6" sx={{ opacity: 0.9 }}>
        {message}
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>
        Saldivia Buses ERP
      </Typography>
    </Box>
  );
} 