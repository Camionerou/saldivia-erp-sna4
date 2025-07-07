'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  AppBar,
  Toolbar,
  Chip,
  Avatar,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Group,
  Person,
  Security,
  Edit,
  Delete,
  Refresh
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import api from '@/services/authService';
import UserModal from '@/components/users/UserModal';
import DeleteUserDialog from '@/components/users/DeleteUserDialog';
import { User, Profile } from '@/types/user';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Estados para modales
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Estados para notificaciones
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, profilesRes] = await Promise.all([
        api.get('/api/users'),
        api.get('/api/users/profiles'),
      ]);
      
      setUsers(usersRes.data);
      setProfiles(profilesRes.data);
    } catch (error) {
      console.error('Error fetching users data:', error);
      showSnackbar('Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      setActionLoading(true);
      
      if (selectedUser) {
        // Actualizar usuario existente
        await api.put(`/api/users/${selectedUser.id}`, userData);
        showSnackbar('Usuario actualizado correctamente', 'success');
      } else {
        // Crear nuevo usuario
        await api.post('/api/users', userData);
        showSnackbar('Usuario creado correctamente', 'success');
      }
      
      await fetchData(); // Recargar datos
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al guardar el usuario';
      showSnackbar(errorMessage, 'error');
      throw error; // Re-lanzar para que el modal pueda manejarlo
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    
    try {
      setActionLoading(true);
      await api.delete(`/api/users/${selectedUser.id}`);
      showSnackbar('Usuario eliminado correctamente', 'success');
      await fetchData(); // Recargar datos
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al eliminar el usuario';
      showSnackbar(errorMessage, 'error');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const activeUsers = users.filter(u => u.active).length;
  const inactiveUsers = users.filter(u => !u.active).length;

  if (loading) {
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
          <Group sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Usuarios
          </Typography>
          <Button
            color="inherit"
            startIcon={<Refresh />}
            onClick={fetchData}
            sx={{ mr: 1 }}
          >
            Actualizar
          </Button>
          <Button
            color="inherit"
            startIcon={<Add />}
            onClick={handleCreateUser}
          >
            Nuevo Usuario
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        {/* Resumen */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Person color="success" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" gutterBottom>
                    Usuarios Activos
                  </Typography>
                </Box>
                <Typography variant="h4" color="success.main">
                  {activeUsers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Person color="error" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" gutterBottom>
                    Usuarios Inactivos
                  </Typography>
                </Box>
                <Typography variant="h4" color="error.main">
                  {inactiveUsers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Security color="primary" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" gutterBottom>
                    Perfiles de Usuario
                  </Typography>
                </Box>
                <Typography variant="h4" color="primary.main">
                  {profiles.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Usuarios */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Usuarios del Sistema
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Usuario</TableCell>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Perfil</TableCell>
                        <TableCell>Último Acceso</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                                {user.firstName?.charAt(0) || user.username.charAt(0)}
                              </Avatar>
                              {user.username}
                            </Box>
                          </TableCell>
                          <TableCell>{user.firstName} {user.lastName}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Chip
                              label={user.profile || 'Sin perfil'}
                              size="small"
                              color={user.profile ? 'primary' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('es-AR') : 'Nunca'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.active ? 'Activo' : 'Inactivo'}
                              size="small"
                              color={user.active ? 'success' : 'error'}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton 
                              size="small"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Perfiles */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Perfiles de Usuario
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Perfil</TableCell>
                        <TableCell>Descripción</TableCell>
                        <TableCell align="right">Usuarios</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {profiles.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell>
                            <Chip
                              label={profile.name}
                              size="small"
                              color="primary"
                            />
                          </TableCell>
                          <TableCell>{profile.description}</TableCell>
                          <TableCell align="right">{profile.userCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Modales */}
      <UserModal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        onSave={handleSaveUser}
        user={selectedUser}
        profiles={profiles}
        isLoading={actionLoading}
      />

      <DeleteUserDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        user={selectedUser}
        isLoading={actionLoading}
      />

      {/* Notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 