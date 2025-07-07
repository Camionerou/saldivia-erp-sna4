'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  IconButton,
  AppBar,
  Toolbar,
  Button,
  Menu,
  MenuItem,
  Divider,
  Container,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Receipt,
  People,
  DirectionsBus,
  Notifications,
  AccountCircle,
  ExitToApp,
  Dashboard as DashboardIcon,
  AccountBalanceWallet,
  ShoppingCart,
  Sell,
  Assessment,
  Settings,
  Group,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/services/authService';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserAvatar from '@/components/common/UserAvatar';

interface DashboardStats {
  totalSales: number;
  totalPurchases: number;
  bankBalance: number;
  pendingInvoices: number;
  recentTransactions: Array<{
    id: number;
    description: string;
    amount: number;
    date: string;
  }>;
}

interface Notification {
  id: number;
  message: string;
  type: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    console.log('DashboardPage - user:', user);
    
    if (!user) {
      console.log('No hay usuario, redirigiendo a login...');
      router.push('/');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        console.log('Obteniendo datos del dashboard...');
        const [statsResponse, notificationsResponse] = await Promise.all([
          api.get('/api/dashboard/stats'),
          api.get('/api/dashboard/notifications'),
        ]);
        
        console.log('Datos obtenidos:', { stats: statsResponse.data, notifications: notificationsResponse.data });
        setStats(statsResponse.data);
        setNotifications(notificationsResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, router]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const menuItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { label: 'Contabilidad', icon: <AccountBalance />, path: '/accounting' },
    { label: 'Caja y Bancos', icon: <AccountBalanceWallet />, path: '/banking' },
    { label: 'Compras', icon: <ShoppingCart />, path: '/purchases' },
    { label: 'Ventas', icon: <Sell />, path: '/sales' },
    { label: 'Impuestos', icon: <Assessment />, path: '/tax' },
    { label: 'Usuarios', icon: <Group />, path: '/users' },
    { label: 'Configuración', icon: <Settings />, path: '/settings' },
  ];

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <ProtectedRoute>
      <Box sx={{ flexGrow: 1 }}>
        {/* Header */}
        <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #1976d2, #42a5f5)' }}>
        <Toolbar>
          <DirectionsBus sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Saldivia Buses ERP
          </Typography>
          
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Notifications />
          </IconButton>
          
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            onClick={handleMenuOpen}
          >
            <UserAvatar />
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => {
              router.push('/profile');
              handleMenuClose();
            }}>
              <AccountCircle sx={{ mr: 1 }} />
              Mi Perfil
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        {/* Navegación rápida */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Módulos del Sistema
          </Typography>
          <Grid container spacing={2}>
            {menuItems.map((item) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={item.path}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={item.icon}
                  onClick={() => router.push(item.path)}
                  sx={{ 
                    py: 1.5,
                    flexDirection: 'column',
                    height: '80px',
                    '& .MuiButton-startIcon': {
                      margin: 0,
                      mb: 0.5,
                    },
                  }}
                >
                  <Typography variant="caption" textAlign="center">
                    {item.label}
                  </Typography>
                </Button>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Estadísticas principales */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp color="success" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" gutterBottom>
                    Ventas Totales
                  </Typography>
                </Box>
                <Typography variant="h4" color="success.main">
                  {stats ? formatCurrency(stats.totalSales) : '$0'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingDown color="error" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" gutterBottom>
                    Compras Totales
                  </Typography>
                </Box>
                <Typography variant="h4" color="error.main">
                  {stats ? formatCurrency(stats.totalPurchases) : '$0'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccountBalance color="primary" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" gutterBottom>
                    Saldo Bancario
                  </Typography>
                </Box>
                <Typography variant="h4" color="primary.main">
                  {stats ? formatCurrency(stats.bankBalance) : '$0'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Receipt color="warning" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" gutterBottom>
                    Facturas Pendientes
                  </Typography>
                </Box>
                <Typography variant="h4" color="warning.main">
                  {stats ? stats.pendingInvoices : 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Contenido principal */}
        <Grid container spacing={3}>
          {/* Transacciones recientes */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Transacciones Recientes
                </Typography>
                <List>
                  {stats?.recentTransactions.map((transaction) => (
                    <ListItem key={transaction.id}>
                      <ListItemIcon>
                        {transaction.amount > 0 ? (
                          <TrendingUp color="success" />
                        ) : (
                          <TrendingDown color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={transaction.description}
                        secondary={new Date(transaction.date).toLocaleDateString('es-AR')}
                      />
                      <Typography
                        variant="body2"
                        color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                        fontWeight="bold"
                      >
                        {formatCurrency(Math.abs(transaction.amount))}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Notificaciones */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notificaciones
                </Typography>
                <List>
                  {notifications.map((notification) => (
                    <ListItem key={notification.id}>
                      <ListItemText
                        primary={notification.message}
                        secondary={new Date(notification.createdAt).toLocaleDateString('es-AR')}
                      />
                      <Chip
                        label={notification.type}
                        size="small"
                        color={
                          notification.type === 'success' ? 'success' :
                          notification.type === 'warning' ? 'warning' :
                          notification.type === 'error' ? 'error' : 'info'
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Información de bienvenida */}
        <Paper sx={{ p: 3, mt: 3, textAlign: 'center', background: 'linear-gradient(45deg, #f5f5f5, #e3f2fd)' }}>
          <Typography variant="h5" gutterBottom>
            ¡Bienvenido al ERP Saldivia Buses!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Sistema de gestión integral modernizado para optimizar las operaciones de tu empresa de transporte.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Usuario: <strong>{user?.username}</strong> | 
            Perfil: <strong>{user?.profile?.name || 'Usuario'}</strong> | 
            Alvear, Santa Fe, Argentina
          </Typography>
        </Paper>
      </Container>
    </Box>
    </ProtectedRoute>
  );
} 