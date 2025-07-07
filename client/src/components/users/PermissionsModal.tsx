'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Security,
  AccountBalance,
  ShoppingCart,
  Sell,
  Receipt,
  Dashboard,
  People,
  Settings
} from '@mui/icons-material';
import { User, Profile } from '@/types/user';

interface PermissionsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (permissions: string[]) => Promise<void>;
  user: User | null;
  isLoading?: boolean;
}

// Definición de módulos y permisos disponibles
const PERMISSION_MODULES = {
  dashboard: {
    name: 'Dashboard',
    icon: <Dashboard />,
    permissions: [
      { key: 'dashboard.view', name: 'Ver dashboard', description: 'Acceso a la página principal' },
      { key: 'dashboard.stats', name: 'Ver estadísticas', description: 'Ver métricas y reportes generales' }
    ]
  },
  users: {
    name: 'Usuarios',
    icon: <People />,
    permissions: [
      { key: 'users.view', name: 'Ver usuarios', description: 'Listar y consultar usuarios' },
      { key: 'users.create', name: 'Crear usuarios', description: 'Agregar nuevos usuarios' },
      { key: 'users.edit', name: 'Editar usuarios', description: 'Modificar datos de usuarios' },
      { key: 'users.delete', name: 'Eliminar usuarios', description: 'Borrar usuarios del sistema' },
      { key: 'users.permissions', name: 'Gestionar permisos', description: 'Administrar permisos de usuarios' }
    ]
  },
  accounting: {
    name: 'Contabilidad',
    icon: <AccountBalance />,
    permissions: [
      { key: 'accounting.view', name: 'Ver contabilidad', description: 'Consultar datos contables' },
      { key: 'accounting.entries', name: 'Asientos contables', description: 'Crear y editar asientos' },
      { key: 'accounting.reports', name: 'Reportes contables', description: 'Generar balances y reportes' },
      { key: 'accounting.close', name: 'Cierre de ejercicio', description: 'Realizar cierre contable' }
    ]
  },
  purchases: {
    name: 'Compras',
    icon: <ShoppingCart />,
    permissions: [
      { key: 'purchases.view', name: 'Ver compras', description: 'Consultar órdenes de compra' },
      { key: 'purchases.create', name: 'Crear compras', description: 'Generar nuevas órdenes' },
      { key: 'purchases.approve', name: 'Aprobar compras', description: 'Autorizar órdenes de compra' },
      { key: 'purchases.receive', name: 'Recepcionar', description: 'Confirmar recepción de mercadería' }
    ]
  },
  sales: {
    name: 'Ventas',
    icon: <Sell />,
    permissions: [
      { key: 'sales.view', name: 'Ver ventas', description: 'Consultar ventas y cotizaciones' },
      { key: 'sales.create', name: 'Crear ventas', description: 'Generar presupuestos y ventas' },
      { key: 'sales.approve', name: 'Aprobar ventas', description: 'Autorizar descuentos especiales' },
      { key: 'sales.reports', name: 'Reportes de ventas', description: 'Comisiones y estadísticas' }
    ]
  },
  tax: {
    name: 'Impuestos',
    icon: <Receipt />,
    permissions: [
      { key: 'tax.view', name: 'Ver impuestos', description: 'Consultar declaraciones fiscales' },
      { key: 'tax.calculate', name: 'Calcular impuestos', description: 'Procesar cálculos fiscales' },
      { key: 'tax.reports', name: 'Reportes fiscales', description: 'DDJJ y libros fiscales' },
      { key: 'tax.submit', name: 'Presentar DDJJ', description: 'Enviar declaraciones a AFIP' }
    ]
  },
  system: {
    name: 'Sistema',
    icon: <Settings />,
    permissions: [
      { key: 'system.config', name: 'Configuración', description: 'Parámetros del sistema' },
      { key: 'system.backup', name: 'Respaldos', description: 'Backup y restauración' },
      { key: 'system.audit', name: 'Auditoría', description: 'Logs y seguimiento de acciones' },
      { key: 'system.admin', name: 'Administración total', description: 'Acceso completo al sistema' }
    ]
  }
};

export default function PermissionsModal({ 
  open, 
  onClose, 
  onSave, 
  user,
  isLoading = false 
}: PermissionsModalProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      // Cargar permisos actuales del usuario
      const currentPermissions = Array.isArray(user.profile.permissions) 
        ? user.profile.permissions 
        : [];
      setSelectedPermissions(currentPermissions);
    } else {
      setSelectedPermissions([]);
    }
  }, [user]);

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permission]);
    } else {
      setSelectedPermissions(prev => prev.filter(p => p !== permission));
    }
  };

  const handleModuleToggle = (moduleKey: string, checked: boolean) => {
    const modulePermissions = PERMISSION_MODULES[moduleKey as keyof typeof PERMISSION_MODULES].permissions.map(p => p.key);
    
    if (checked) {
      // Agregar todos los permisos del módulo
      setSelectedPermissions(prev => {
        const newPermissions = [...prev];
        modulePermissions.forEach(perm => {
          if (!newPermissions.includes(perm)) {
            newPermissions.push(perm);
          }
        });
        return newPermissions;
      });
    } else {
      // Quitar todos los permisos del módulo
      setSelectedPermissions(prev => 
        prev.filter(perm => !modulePermissions.includes(perm))
      );
    }
  };

  const getModuleStatus = (moduleKey: string) => {
    const modulePermissions = PERMISSION_MODULES[moduleKey as keyof typeof PERMISSION_MODULES].permissions.map(p => p.key);
    const selectedCount = modulePermissions.filter(perm => selectedPermissions.includes(perm)).length;
    
    if (selectedCount === 0) return 'none';
    if (selectedCount === modulePermissions.length) return 'all';
    return 'partial';
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(selectedPermissions);
      onClose();
    } catch (error) {
      console.error('Error al guardar permisos:', error);
    } finally {
      setSaving(false);
    }
  };

  const getPermissionCount = () => {
    const totalPermissions = Object.values(PERMISSION_MODULES)
      .reduce((total, module) => total + module.permissions.length, 0);
    return { selected: selectedPermissions.length, total: totalPermissions };
  };

  const permissionStats = getPermissionCount();

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Security sx={{ mr: 1 }} />
          Gestión de Permisos - {user?.username}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Resumen */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Selecciona los permisos específicos para este usuario. 
            Los permisos determinan qué módulos y funciones puede usar.
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Chip 
              label={`${permissionStats.selected} de ${permissionStats.total} permisos seleccionados`}
              color="primary"
              variant="outlined"
              size="small"
            />
          </Box>
        </Alert>

        {/* Módulos de permisos */}
        <Grid container spacing={2}>
          {Object.entries(PERMISSION_MODULES).map(([moduleKey, module]) => {
            const moduleStatus = getModuleStatus(moduleKey);
            
            return (
              <Grid item xs={12} md={6} key={moduleKey}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    borderColor: moduleStatus === 'all' ? 'primary.main' : 
                                moduleStatus === 'partial' ? 'warning.main' : 'inherit'
                  }}
                >
                  <CardContent>
                    {/* Header del módulo */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {module.icon}
                      <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
                        {module.name}
                      </Typography>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={moduleStatus === 'all'}
                            indeterminate={moduleStatus === 'partial'}
                            onChange={(e) => handleModuleToggle(moduleKey, e.target.checked)}
                          />
                        }
                        label="Todo"
                      />
                    </Box>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    {/* Permisos individuales */}
                    <FormGroup>
                      {module.permissions.map((permission) => (
                        <FormControlLabel
                          key={permission.key}
                          control={
                            <Checkbox
                              checked={selectedPermissions.includes(permission.key)}
                              onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                              size="small"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" component="div">
                                {permission.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {permission.description}
                              </Typography>
                            </Box>
                          }
                        />
                      ))}
                    </FormGroup>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          disabled={saving || isLoading}
          startIcon={saving ? <CircularProgress size={20} /> : <Security />}
        >
          {saving ? 'Guardando...' : 'Guardar Permisos'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}