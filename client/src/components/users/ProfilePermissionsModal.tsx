'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip
} from '@mui/material';
import { Close, Add, Edit, Delete } from '@mui/icons-material';
import api from '@/services/authService';

interface Profile {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

interface ProfilePermissionsModalProps {
  open: boolean;
  onClose: () => void;
  onProfilesUpdated: () => void;
}

const AVAILABLE_PERMISSIONS = [
  { key: 'all', label: 'Acceso Total', description: 'Acceso completo al sistema' },
  { key: 'admin', label: 'Administrador', description: 'Permisos administrativos' },
  { key: 'users.read', label: 'Ver Usuarios', description: 'Consultar información de usuarios' },
  { key: 'users.write', label: 'Gestionar Usuarios', description: 'Crear y editar usuarios' },
  { key: 'users.delete', label: 'Eliminar Usuarios', description: 'Eliminar usuarios del sistema' },
  { key: 'users.permissions', label: 'Gestionar Permisos', description: 'Modificar permisos de usuarios' },
  { key: 'users.password', label: 'Cambiar Contraseñas', description: 'Modificar contraseñas de usuarios' },
  { key: 'users.history', label: 'Ver Historial', description: 'Consultar historial de cambios' },
  { key: 'users.export', label: 'Exportar Datos', description: 'Descargar información de usuarios' },
  { key: 'accounting', label: 'Contabilidad', description: 'Acceso al módulo de contabilidad' },
  { key: 'banking', label: 'Caja y Bancos', description: 'Gestión de cuentas bancarias' },
  { key: 'purchases', label: 'Compras', description: 'Gestión de compras y proveedores' },
  { key: 'sales', label: 'Ventas', description: 'Gestión de ventas y clientes' },
  { key: 'tax', label: 'Impuestos', description: 'Gestión de IVA y otros impuestos' },
  { key: 'dashboard', label: 'Dashboard', description: 'Acceso al panel principal' },
  { key: 'reports', label: 'Reportes', description: 'Generación de reportes' }
];

export default function ProfilePermissionsModal({ 
  open, 
  onClose, 
  onProfilesUpdated 
}: ProfilePermissionsModalProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estados para crear/editar perfil
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    if (open) {
      loadProfiles();
    }
  }, [open]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users/profiles');
      setProfiles(response.data);
    } catch (error: any) {
      setError('Error al cargar perfiles');
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = () => {
    setFormData({ name: '', description: '', permissions: [] });
    setEditingProfile(null);
    setShowCreateForm(true);
  };

  const handleEditProfile = (profile: Profile) => {
    setFormData({
      name: profile.name,
      description: profile.description,
      permissions: [...profile.permissions]
    });
    setEditingProfile(profile);
    setShowCreateForm(true);
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este perfil?')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/api/users/profiles/${profileId}`);
      setSuccess('Perfil eliminado correctamente');
      loadProfiles();
      onProfilesUpdated();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al eliminar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!formData.name.trim()) {
        setError('El nombre del perfil es requerido');
        return;
      }

      if (editingProfile) {
        // Actualizar perfil existente
        await api.put(`/api/users/profiles/${editingProfile.id}`, formData);
        setSuccess('Perfil actualizado correctamente');
      } else {
        // Crear nuevo perfil
        await api.post('/api/users/profiles', formData);
        setSuccess('Perfil creado correctamente');
      }

      setShowCreateForm(false);
      loadProfiles();
      onProfilesUpdated();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al guardar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission)
    }));
  };

  const handleClose = () => {
    setShowCreateForm(false);
    setEditingProfile(null);
    setError(null);
    setSuccess(null);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Gestión de Perfiles y Permisos
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {loading && (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress />
          </Box>
        )}

        {!showCreateForm ? (
          <>
            {/* Lista de perfiles existentes */}
            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Perfiles Existentes</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleCreateProfile}
                >
                  Crear Perfil
                </Button>
              </Box>

              <List>
                {profiles.map((profile) => (
                  <ListItem key={profile.id} divider>
                    <ListItemText
                      primary={profile.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {profile.description}
                          </Typography>
                          <Box mt={1}>
                            {profile.permissions.map((permission) => (
                              <Chip
                                key={permission}
                                label={AVAILABLE_PERMISSIONS.find(p => p.key === permission)?.label || permission}
                                size="small"
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            ))}
                          </Box>
                          <Typography variant="caption" color="textSecondary">
                            {profile.userCount} usuario(s) asignado(s)
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleEditProfile(profile)}
                        sx={{ mr: 1 }}
                      >
                        <Edit />
                      </IconButton>
                      {profile.userCount === 0 && (
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteProfile(profile.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          </>
        ) : (
          <>
            {/* Formulario de crear/editar perfil */}
            <Box>
              <Typography variant="h6" mb={2}>
                {editingProfile ? 'Editar Perfil' : 'Crear Nuevo Perfil'}
              </Typography>

              <TextField
                fullWidth
                label="Nombre del Perfil"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Descripción"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                margin="normal"
                multiline
                rows={2}
              />

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" mb={2}>
                Permisos
              </Typography>

              <FormGroup>
                {AVAILABLE_PERMISSIONS.map((permission) => (
                  <FormControlLabel
                    key={permission.key}
                    control={
                      <Checkbox
                        checked={formData.permissions.includes(permission.key)}
                        onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {permission.label}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {permission.description}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        {showCreateForm ? (
          <>
            <Button onClick={() => setShowCreateForm(false)}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveProfile}
              disabled={loading}
            >
              {editingProfile ? 'Actualizar' : 'Crear'}
            </Button>
          </>
        ) : (
          <Button onClick={handleClose}>
            Cerrar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
} 