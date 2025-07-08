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
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableSortLabel,
  Pagination,
  Stack,
  Collapse,
  Paper,
  Menu,
  MenuList,
  ListItemIcon,
  ListItemText,
  Fab,
  Tooltip
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Group,
  Person,
  Security,
  Edit,
  Delete,
  Refresh,
  Search,
  FilterList,
  GetApp,
  History,
  VpnKey,
  TableChart,
  Description,
  FileDownload
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import api from '@/services/authService';
import UserModal from '@/components/users/UserModal';
import DeleteUserDialog from '@/components/users/DeleteUserDialog';
import PermissionsModal from '@/components/users/PermissionsModal';
import ChangePasswordModal from '@/components/users/ChangePasswordModal';
import UserHistoryModal from '@/components/users/UserHistoryModal';
import ProfileManager from '@/components/users/ProfileManager';
import ProfilePermissionsModal from '@/components/users/ProfilePermissionsModal';
import UserActionsMenu from '@/components/users/UserActionsMenu';
import UserAvatar from '@/components/common/UserAvatar';
import { usePermissions } from '@/hooks/usePermissions';
import { User, Profile } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';

export default function UsersPage() {
  const router = useRouter();
  const permissions = usePermissions();
  const { refreshUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Estados para paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(10);
  
  // Estados para filtros
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [profileFilter, setProfileFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Estados para modales
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [profileManagerOpen, setProfileManagerOpen] = useState(false);
  const [profilePermissionsModalOpen, setProfilePermissionsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Estados para notificaciones
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Construir parámetros de consulta
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder
      });
      
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (profileFilter) params.append('profile', profileFilter);
      
      const [usersRes, profilesRes] = await Promise.all([
        api.get(`/api/users?${params.toString()}`),
        api.get('/api/users/profiles'),
      ]);
      
      // Manejar respuesta con paginación
      if (usersRes.data.users) {
        setUsers(usersRes.data.users);
        setTotalPages(usersRes.data.pagination.totalPages);
        setTotalCount(usersRes.data.pagination.totalCount);
      } else {
        // Retrocompatibilidad con respuesta sin paginación
        setUsers(usersRes.data);
        setTotalPages(1);
        setTotalCount(usersRes.data.length);
      }
      
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
  }, [page, search, statusFilter, profileFilter, sortBy, sortOrder]);

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // Mover el reset de página aquí
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);
  
  // Funciones de manejo de filtros
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchInput(value);
    // Remover el setPage(1) de aquí para evitar re-renders innecesarios
  };
  
  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value as string);
    setPage(1);
  };
  
  const handleProfileFilterChange = (event: any) => {
    setProfileFilter(event.target.value as string);
    setPage(1);
  };
  
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(1);
  };
  
  const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };
  
  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setStatusFilter('all');
    setProfileFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };
  
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      setActionLoading(true);
      console.log('Iniciando exportación en formato:', format);
      
      const response = await api.get(`/api/users/export?format=${format}`, {
        responseType: 'blob'
      });
      
      console.log('Respuesta de exportación recibida:', response.headers);
      
      // Crear URL para descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Definir nombre del archivo
      const today = new Date().toISOString().split('T')[0];
      const filename = format === 'csv' 
        ? `usuarios_${today}.csv`
        : `usuarios_${today}.xlsx`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('Archivo descargado exitosamente:', filename);
      showSnackbar(`Usuarios exportados correctamente a ${format.toUpperCase()}`, 'success');
    } catch (error: any) {
      console.error('Error al exportar usuarios:', error);
      const errorMessage = error.response?.data?.error || 'Error al exportar usuarios';
      showSnackbar(errorMessage, 'error');
    } finally {
      setActionLoading(false);
    }
  };

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

  const handleManagePermissions = (user: User) => {
    setSelectedUser(user);
    setPermissionsModalOpen(true);
  };

  const handleSavePermissions = async (permissions: string[]) => {
    if (!selectedUser) return;
    
    try {
      setActionLoading(true);
      await api.put(`/api/users/${selectedUser.id}/permissions`, { permissions });
      showSnackbar('Permisos actualizados correctamente', 'success');
      await fetchData(); // Recargar datos
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al actualizar permisos';
      showSnackbar(errorMessage, 'error');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangePassword = (user: User) => {
    setSelectedUser(user);
    setPasswordModalOpen(true);
  };

  const handleSavePassword = async (newPassword: string) => {
    if (!selectedUser) return;
    
    try {
      setActionLoading(true);
      await api.put(`/api/users/${selectedUser.id}/password`, { newPassword });
      showSnackbar('Contraseña actualizada correctamente', 'success');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al cambiar contraseña';
      showSnackbar(errorMessage, 'error');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewHistory = (user: User) => {
    setSelectedUser(user);
    setHistoryModalOpen(true);
  };

  const handleUpdateProfile = async (formData: FormData) => {
    try {
      setActionLoading(true);
      
      // Log para debug
      console.log('Enviando datos del perfil:', Array.from(formData.entries()));
      
      const response = await api.put('/api/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Respuesta del servidor:', response.data);
      
      showSnackbar('Perfil actualizado correctamente', 'success');
      
      // Esperar un momento para que el servidor procese la imagen
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Recargar datos de usuarios y refrescar usuario actual
      await Promise.all([
        fetchData(),
        refreshUser() // Refrescar el usuario actual en el contexto de autenticación
      ]);
      
      return response;
      
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      let errorMessage = 'Error al actualizar el perfil';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showSnackbar(errorMessage, 'error');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      setActionLoading(true);
      
      console.log('Guardando usuario:', userData, 'Modo edición:', !!selectedUser);
      
      if (selectedUser) {
        // Actualizar usuario existente
        await api.put(`/api/users/${selectedUser.id}`, userData);
        showSnackbar('Usuario actualizado correctamente', 'success');
      } else {
        // Crear nuevo usuario
        console.log('Creando nuevo usuario con datos:', userData);
        const response = await api.post('/api/users', userData);
        console.log('Usuario creado exitosamente:', response.data);
        showSnackbar('Usuario creado correctamente', 'success');
      }
      
      await fetchData(); // Recargar datos
      setUserModalOpen(false); // Cerrar modal explícitamente
      setSelectedUser(null); // Limpiar usuario seleccionado
      
    } catch (error: any) {
      console.error('Error al guardar usuario:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error al guardar el usuario';
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
            startIcon={<FilterList />}
            onClick={() => setFiltersOpen(!filtersOpen)}
            sx={{ mr: 1 }}
          >
            Filtros
          </Button>
          <Button
            color="inherit"
            startIcon={<Person />}
            onClick={() => setProfileManagerOpen(true)}
            sx={{ mr: 1 }}
          >
            Mi Perfil
          </Button>
          {permissions.canManagePermissions() && (
            <Button
              color="inherit"
              startIcon={<Security />}
              onClick={() => setProfilePermissionsModalOpen(true)}
              sx={{ mr: 1 }}
            >
              Gestionar Perfiles
            </Button>
          )}
          {permissions.canCreateUsers() && (
            <Button
              color="inherit"
              startIcon={<Add />}
              onClick={handleCreateUser}
            >
              Nuevo Usuario
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        {/* Filtros */}
        <Collapse in={filtersOpen}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Filtros y Búsqueda
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Buscar usuarios"
                  value={searchInput}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Nombre, email, usuario..."
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Estado"
                    onChange={handleStatusFilterChange}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="active">Activos</MenuItem>
                    <MenuItem value="inactive">Inactivos</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Perfil</InputLabel>
                  <Select
                    value={profileFilter}
                    label="Perfil"
                    onChange={handleProfileFilterChange}
                  >
                    <MenuItem value="">Todos los perfiles</MenuItem>
                    {profiles.map((profile) => (
                      <MenuItem key={profile.id} value={profile.name}>
                        {profile.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={clearFilters}
                  >
                    Limpiar
                  </Button>
                </Stack>
              </Grid>
            </Grid>
            
            {/* Información de resultados */}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Mostrando {users.length} de {totalCount} usuarios
              {search && ` (filtrados por "${search}")`}
            </Typography>
          </Paper>
        </Collapse>

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
                  <Table size="small" sx={{ '& .MuiTableCell-root': { py: 1 } }}>
                    <TableHead>
                      <TableRow sx={{ '& .MuiTableCell-head': { fontWeight: 600, bgcolor: 'grey.50' } }}>
                        <TableCell>
                          <TableSortLabel
                            active={sortBy === 'username'}
                            direction={sortBy === 'username' ? sortOrder : 'asc'}
                            onClick={() => handleSort('username')}
                          >
                            Usuario
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={sortBy === 'name'}
                            direction={sortBy === 'name' ? sortOrder : 'asc'}
                            onClick={() => handleSort('name')}
                          >
                            Nombre
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Perfil</TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={sortBy === 'lastLogin'}
                            direction={sortBy === 'lastLogin' ? sortOrder : 'asc'}
                            onClick={() => handleSort('lastLogin')}
                          >
                            Último Acceso
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell align="center" sx={{ width: 80 }}>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow 
                          key={user.id}
                          sx={{ 
                            '&:hover': { bgcolor: 'action.hover' },
                            '&:last-child td, &:last-child th': { border: 0 }
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <UserAvatar
                                src={typeof user.profile === 'object' ? user.profile?.profileImage : undefined}
                                firstName={user.firstName}
                                lastName={user.lastName}
                                username={user.username}
                                size={32}
                                sx={{ mr: 1.5 }}
                              />
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {user.username}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {user.firstName} {user.lastName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={typeof user.profile === 'string' ? user.profile : user.profile?.name || 'Sin perfil'}
                              size="small"
                              color={user.profile ? 'primary' : 'default'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('es-AR') : 'Nunca'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.active ? 'Activo' : 'Inactivo'}
                              size="small"
                              color={user.active ? 'success' : 'error'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <UserActionsMenu
                              user={user}
                              onEdit={handleEditUser}
                              onManagePermissions={handleManagePermissions}
                              onChangePassword={handleChangePassword}
                              onViewHistory={handleViewHistory}
                              onDelete={handleDeleteUser}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {/* Paginación */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                )}
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

      {/* Menú de exportación */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
      >
        <MenuList>
          <MenuItem onClick={() => {
            handleExport('csv');
            setExportMenuAnchor(null);
          }}>
            <ListItemIcon>
              <TableChart />
            </ListItemIcon>
            <ListItemText primary="Exportar a CSV" />
          </MenuItem>
          <MenuItem onClick={() => {
            handleExport('excel');
            setExportMenuAnchor(null);
          }}>
            <ListItemIcon>
              <Description />
            </ListItemIcon>
            <ListItemText primary="Exportar a Excel (.xlsx)" />
          </MenuItem>
        </MenuList>
      </Menu>

      {/* Botón de exportar flotante */}
      {permissions.canExportData() && (
        <Tooltip title="Exportar Datos">
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              zIndex: 1000,
            }}
            onClick={(event) => setExportMenuAnchor(event.currentTarget)}
            disabled={actionLoading}
          >
            <FileDownload />
          </Fab>
        </Tooltip>
      )}

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

      <PermissionsModal
        open={permissionsModalOpen}
        onClose={() => setPermissionsModalOpen(false)}
        onSave={handleSavePermissions}
        user={selectedUser}
        isLoading={actionLoading}
      />

      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSave={handleSavePassword}
        user={selectedUser}
        isLoading={actionLoading}
      />

      <UserHistoryModal
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        user={selectedUser}
      />

      <ProfileManager
        open={profileManagerOpen}
        onClose={() => setProfileManagerOpen(false)}
        onUpdateProfile={handleUpdateProfile}
      />

      <ProfilePermissionsModal
        open={profilePermissionsModalOpen}
        onClose={() => setProfilePermissionsModalOpen(false)}
        onProfilesUpdated={fetchData}
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