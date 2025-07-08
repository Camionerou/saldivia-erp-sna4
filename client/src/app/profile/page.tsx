'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  IconButton,
  AppBar,
  Toolbar,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Person,
  History,
  Security,
  VpnKey,
  Add,
  Delete
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProfileManager from '@/components/users/ProfileManager';
import UserAvatar from '@/components/common/UserAvatar';
import api from '@/services/authService';

interface ActivityEntry {
  id: string;
  action: string;
  resource: string;
  createdAt: string;
  description?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [profileManagerOpen, setProfileManagerOpen] = useState(false);
  const [recentActivity, setRecentActivity] = useState<ActivityEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchRecentActivity();
    }
  }, [user]);

  const fetchRecentActivity = async () => {
    if (!user) return;
    
    try {
      setActivityLoading(true);
      setActivityError(null);
      const response = await api.get(`/api/users/${user.id}/history`);
      const activities = (response.data.history || response.data || []).slice(0, 5); // Últimas 5 actividades
      setRecentActivity(activities);
    } catch (error: any) {
      console.error('Error al cargar actividad reciente:', error);
      setActivityError('No se pudo cargar la actividad reciente');
      setRecentActivity([]);
    } finally {
      setActivityLoading(false);
    }
  };

  const handleUpdateProfile = async (formData: FormData) => {
    try {
      const response = await api.put('/api/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Refrescar el usuario en el contexto
      await refreshUser();
      
      // Refrescar actividad reciente
      await fetchRecentActivity();
      
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'crear':
      case 'create':
        return <Add />;
      case 'actualizar':
      case 'actualizar_perfil':
      case 'update':
        return <Edit />;
      case 'eliminar':
      case 'delete':
        return <Delete />;
      case 'cambiar_contraseña':
      case 'change_password':
        return <VpnKey />;
      case 'actualizar_permisos':
      case 'update_permissions':
        return <Security />;
      case 'login':
        return <Person />;
      default:
        return <History />;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'crear':
      case 'create':
        return 'success';
      case 'actualizar':
      case 'actualizar_perfil':
      case 'update':
        return 'primary';
      case 'eliminar':
      case 'delete':
        return 'error';
      case 'cambiar_contraseña':
      case 'change_password':
        return 'warning';
      case 'actualizar_permisos':
      case 'update_permissions':
        return 'secondary';
      case 'login':
        return 'info';
      default:
        return 'default';
    }
  };

  const getActivityDescription = (activity: ActivityEntry) => {
    const action = activity.action.toLowerCase();
    
    switch (action) {
      case 'crear':
      case 'create':
        return 'Cuenta creada';
      case 'actualizar_perfil':
        return 'Perfil actualizado';
      case 'actualizar':
      case 'update':
        return 'Información actualizada';
      case 'cambiar_contraseña':
      case 'change_password':
        return 'Contraseña modificada';
      case 'actualizar_permisos':
      case 'update_permissions':
        return 'Permisos actualizados';
      case 'login':
        return 'Inicio de sesión';
      default:
        return activity.action;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };



  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowBack />
          </IconButton>
          <Person sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Mi Perfil
          </Typography>
          <Button
            color="inherit"
            startIcon={<Edit />}
            onClick={() => setProfileManagerOpen(true)}
          >
            Editar Perfil
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3, mb: 3 }}>
        <Grid container spacing={3}>
          {/* Información del perfil */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <UserAvatar
                    src={user?.profile?.profileImage}
                    firstName={user?.firstName}
                    lastName={user?.lastName}
                    username={user?.username}
                    size={80}
                    sx={{ mr: 3 }}
                  />
                  <Box>
                    <Typography variant="h4" gutterBottom>
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      @{user.username}
                    </Typography>
                    <Chip
                      label={typeof user.profile === 'string' ? user.profile : user.profile?.name || 'Sin perfil'}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {user.email}
                    </Typography>
                  </Grid>
                  
                  {user.profile && typeof user.profile === 'object' && user.profile.phone && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Teléfono
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {user.profile.phone}
                      </Typography>
                    </Grid>
                  )}
                  
                  {user.profile && typeof user.profile === 'object' && user.profile.department && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Departamento
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {user.profile.department}
                      </Typography>
                    </Grid>
                  )}
                  
                  {user.profile && typeof user.profile === 'object' && user.profile.position && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Cargo
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {user.profile.position}
                      </Typography>
                    </Grid>
                  )}

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Último acceso
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('es-AR') : 'Nunca'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Miembro desde
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {new Date(user.createdAt).toLocaleDateString('es-AR')}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Actividad reciente */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Actividad Reciente
                </Typography>
                
                {activityLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                )}

                {activityError && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    {activityError}
                  </Alert>
                )}

                {!activityLoading && !activityError && recentActivity.length === 0 && (
                  <Alert severity="info">
                    No hay actividad reciente registrada.
                  </Alert>
                )}

                {!activityLoading && !activityError && recentActivity.length > 0 && (
                  <List>
                    {recentActivity.map((activity, index) => (
                      <React.Fragment key={activity.id}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar 
                              sx={{ 
                                bgcolor: `${getActivityColor(activity.action)}.light`,
                                color: `${getActivityColor(activity.action)}.contrastText`,
                                width: 32,
                                height: 32
                              }}
                            >
                              {getActivityIcon(activity.action)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={getActivityDescription(activity)}
                            secondary={formatDate(activity.createdAt)}
                          />
                        </ListItem>
                        {index < recentActivity.length - 1 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>

            {/* Permisos */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Permisos
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {user.profile && typeof user.profile === 'object' && user.profile.permissions?.length > 0 ? (
                    user.profile.permissions.map((permission: string) => (
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
                      Sin permisos específicos asignados
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Modal de edición de perfil */}
      <ProfileManager
        open={profileManagerOpen}
        onClose={() => setProfileManagerOpen(false)}
        onUpdateProfile={handleUpdateProfile}
      />
    </Box>
  );
} 