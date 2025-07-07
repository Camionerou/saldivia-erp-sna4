'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  TextField,
  Grid,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Paper,
  Stack,
  Tabs,
  Tab
} from '@mui/material';
import {
  PhotoCamera,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/authService';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    department: '',
    position: ''
  });

  // Cargar imagen de perfil actual
  useEffect(() => {
    if (user?.profile && typeof user.profile === 'object' && user.profile.profileImage) {
      setProfileImageUrl(`${process.env.NEXT_PUBLIC_API_URL}${user.profile.profileImage}`);
    }
    
    // Actualizar formData con datos del usuario
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: (user?.profile && typeof user.profile === 'object' && user.profile.phone) || '',
      department: (user?.profile && typeof user.profile === 'object' && user.profile.department) || '',
      position: (user?.profile && typeof user.profile === 'object' && user.profile.position) || ''
    });
  }, [user]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamaño (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('La imagen debe ser menor a 2MB');
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: keyof ProfileFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      const formDataToSend = new FormData();
      
      // Agregar datos del perfil
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formDataToSend.append(key, value);
        }
      });

      // Agregar imagen si hay una nueva
      if (fileInputRef.current?.files?.[0]) {
        formDataToSend.append('profileImage', fileInputRef.current.files[0]);
      }

      const response = await api.put('/api/users/profile', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Perfil actualizado correctamente');
      setIsEditing(false);
      
      // Actualizar imagen de perfil si se devolvió una nueva
      if (response.data.profileImage) {
        setProfileImageUrl(`${process.env.NEXT_PUBLIC_API_URL}${response.data.profileImage}`);
      }
      
      // Refrescar datos del usuario
      await refreshUser();
      
      // Limpiar imagen temporal
      setProfileImage(null);
      
      setTimeout(() => {
        setSuccess('');
      }, 5000);

    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: (user?.profile && typeof user.profile === 'object' && user.profile.phone) || '',
      department: (user?.profile && typeof user.profile === 'object' && user.profile.department) || '',
      position: (user?.profile && typeof user.profile === 'object' && user.profile.position) || ''
    });
    setProfileImage(null);
    setError('');
  };

  const getInitials = () => {
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getUserPermissions = () => {
    if (user?.profile && typeof user.profile === 'object') {
      return user.profile.permissions || [];
    }
    return [];
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mi Perfil
      </Typography>

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

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
            <Tab icon={<PersonIcon />} label="Información Personal" />
            <Tab icon={<SecurityIcon />} label="Seguridad" />
            <Tab icon={<HistoryIcon />} label="Actividad" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* Información Personal */}
          <Grid container spacing={3}>
            {/* Foto de perfil */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Box position="relative" display="inline-block">
                  <Avatar
                    sx={{ 
                      width: 150, 
                      height: 150, 
                      mb: 2,
                      fontSize: '3rem',
                      bgcolor: 'primary.main',
                      mx: 'auto'
                    }}
                    src={profileImage || profileImageUrl || undefined}
                  >
                    {!profileImage && !profileImageUrl && getInitials()}
                  </Avatar>
                  
                  {isEditing && (
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        right: 'calc(50% - 75px - 16px)',
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' }
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <PhotoCamera />
                    </IconButton>
                  )}
                </Box>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />

                <Typography variant="h5" gutterBottom>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  @{user?.username}
                </Typography>
                
                {!isEditing && (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                    sx={{ mt: 2 }}
                  >
                    Editar Perfil
                  </Button>
                )}
              </Paper>
            </Grid>

            {/* Información del perfil */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Información Personal
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nombre"
                      value={formData.firstName}
                      onChange={handleInputChange('firstName')}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Apellido"
                      value={formData.lastName}
                      onChange={handleInputChange('lastName')}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Teléfono"
                      value={formData.phone}
                      onChange={handleInputChange('phone')}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Departamento"
                      value={formData.department}
                      onChange={handleInputChange('department')}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Cargo"
                      value={formData.position}
                      onChange={handleInputChange('position')}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                    />
                  </Grid>
                </Grid>

                {isEditing && (
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      onClick={handleCancel}
                      disabled={loading}
                      startIcon={<CancelIcon />}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSave}
                      variant="contained"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    >
                      {loading ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </Box>
                )}
              </Paper>

              {/* Información del sistema */}
              <Paper sx={{ p: 3, mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Información del Sistema
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      ID de Usuario
                    </Typography>
                    <Typography variant="body1">
                      {user?.id}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Nombre de Usuario
                    </Typography>
                    <Typography variant="body1">
                      {user?.username}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Perfil Asignado
                    </Typography>
                    <Typography variant="body1">
                      {typeof user?.profile === 'string' ? user.profile : user?.profile?.name || 'Sin perfil'}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Permisos del Usuario
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {getUserPermissions().length > 0 ? (
                    getUserPermissions().map((permission: string) => (
                      <Chip
                        key={permission}
                        label={permission}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Sin permisos asignados
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Seguridad */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Configuración de Seguridad
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Para cambiar tu contraseña, contacta con el administrador del sistema.
            </Typography>
            
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2">
                  Última conexión
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Nunca'}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2">
                  Cuenta creada
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'No disponible'}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2">
                  Estado de la cuenta
                </Typography>
                <Chip
                  label={user?.active ? 'Activa' : 'Inactiva'}
                  color={user?.active ? 'success' : 'error'}
                  size="small"
                />
              </Box>
            </Stack>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Actividad */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Actividad Reciente
            </Typography>
            <Typography variant="body2" color="text.secondary">
              El historial de actividad estará disponible próximamente.
            </Typography>
          </Paper>
        </TabPanel>
      </Card>
    </Box>
  );
} 