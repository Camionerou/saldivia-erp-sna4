'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  VpnKey,
  Visibility,
  VisibilityOff,
  Security
} from '@mui/icons-material';
import { User } from '@/types/user';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (newPassword: string) => Promise<void>;
  user: User | null;
  isLoading?: boolean;
}

export default function ChangePasswordModal({ 
  open, 
  onClose, 
  onSave, 
  user,
  isLoading = false 
}: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Debe contener al menos una letra mayúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Debe contener al menos una letra minúscula');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Debe contener al menos un número');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Debe contener al menos un carácter especial');
    }
    
    return errors;
  };

  const handlePasswordChange = (password: string) => {
    setNewPassword(password);
    setErrors(validatePassword(password));
  };

  const handleSave = async () => {
    // Validaciones finales
    const passwordErrors = validatePassword(newPassword);
    
    if (passwordErrors.length > 0) {
      setErrors(passwordErrors);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setErrors(['Las contraseñas no coinciden']);
      return;
    }
    
    try {
      setSaving(true);
      await onSave(newPassword);
      
      // Limpiar formulario
      setNewPassword('');
      setConfirmPassword('');
      setErrors([]);
      setShowPassword(false);
      setShowConfirmPassword(false);
      
      onClose();
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    // Limpiar formulario al cerrar
    setNewPassword('');
    setConfirmPassword('');
    setErrors([]);
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const isFormValid = newPassword.length >= 6 && 
                     newPassword === confirmPassword && 
                     errors.length === 0;

  const getPasswordStrength = () => {
    const score = [
      newPassword.length >= 8,
      /[A-Z]/.test(newPassword),
      /[a-z]/.test(newPassword),
      /[0-9]/.test(newPassword),
      /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
    ].reduce((acc, condition) => acc + (condition ? 1 : 0), 0);
    
    if (score <= 2) return { strength: 'Débil', color: 'error' };
    if (score <= 3) return { strength: 'Regular', color: 'warning' };
    if (score <= 4) return { strength: 'Buena', color: 'info' };
    return { strength: 'Excelente', color: 'success' };
  };

  const passwordStrength = newPassword ? getPasswordStrength() : null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <VpnKey sx={{ mr: 1 }} />
          Cambiar Contraseña - {user?.username}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            La nueva contraseña debe cumplir con los siguientes requisitos de seguridad:
          </Typography>
          <ul style={{ margin: '8px 0 0 16px', fontSize: '0.875rem' }}>
            <li>Al menos 6 caracteres (recomendado: 8+)</li>
            <li>Una letra mayúscula</li>
            <li>Una letra minúscula</li>
            <li>Un número</li>
            <li>Un carácter especial (!@#$%^&*)</li>
          </ul>
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Nueva contraseña */}
          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label="Nueva Contraseña"
            value={newPassword}
            onChange={(e) => handlePasswordChange(e.target.value)}
            error={newPassword.length > 0 && errors.length > 0}
            helperText={
              newPassword.length > 0 && errors.length > 0 
                ? errors[0] 
                : `${newPassword.length}/8+ caracteres`
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Security />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Indicador de fortaleza */}
          {passwordStrength && (
            <Alert severity={passwordStrength.color as any} sx={{ py: 1 }}>
              <Typography variant="body2">
                Fortaleza de la contraseña: <strong>{passwordStrength.strength}</strong>
              </Typography>
            </Alert>
          )}

          {/* Confirmar contraseña */}
          <TextField
            fullWidth
            type={showConfirmPassword ? 'text' : 'password'}
            label="Confirmar Nueva Contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={confirmPassword.length > 0 && newPassword !== confirmPassword}
            helperText={
              confirmPassword.length > 0 && newPassword !== confirmPassword
                ? 'Las contraseñas no coinciden'
                : confirmPassword.length > 0 && newPassword === confirmPassword
                ? 'Las contraseñas coinciden ✓'
                : ''
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Security />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Errores de validación */}
          {errors.length > 0 && newPassword.length > 0 && (
            <Alert severity="error">
              <Typography variant="body2" gutterBottom>
                Requisitos faltantes:
              </Typography>
              <ul style={{ margin: '0 0 0 16px', fontSize: '0.875rem' }}>
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          disabled={!isFormValid || saving || isLoading}
          startIcon={saving ? <CircularProgress size={20} /> : <VpnKey />}
        >
          {saving ? 'Cambiando...' : 'Cambiar Contraseña'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}