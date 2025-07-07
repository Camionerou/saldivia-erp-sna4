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
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  History,
  Edit,
  Add,
  Delete,
  Security,
  VpnKey,
  Person,
  Close
} from '@mui/icons-material';
import { User } from '@/types/user';
import api from '@/services/authService';

interface UserHistoryModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

interface AuditLogEntry {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: {
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

export default function UserHistoryModal({ 
  open, 
  onClose, 
  user 
}: UserHistoryModalProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && user) {
      fetchUserHistory();
    }
  }, [open, user]);

  const fetchUserHistory = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/users/${user.id}/history`);
      setAuditLogs(response.data);
    } catch (error: any) {
      console.error('Error al cargar historial:', error);
      setError('Error al cargar el historial del usuario');
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'crear':
        return <Add />;
      case 'update':
      case 'actualizar':
      case 'editar':
        return <Edit />;
      case 'delete':
      case 'eliminar':
        return <Delete />;
      case 'change_password':
      case 'cambiar_contraseña':
        return <VpnKey />;
      case 'update_permissions':
      case 'actualizar_permisos':
        return <Security />;
      default:
        return <Person />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'crear':
        return 'success';
      case 'update':
      case 'actualizar':
      case 'editar':
        return 'primary';
      case 'delete':
      case 'eliminar':
        return 'error';
      case 'change_password':
      case 'cambiar_contraseña':
        return 'warning';
      case 'update_permissions':
      case 'actualizar_permisos':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getActionDescription = (log: AuditLogEntry) => {
    const action = log.action.toLowerCase();
    const resource = log.resource.toLowerCase();
    
    let description = '';
    
    switch (action) {
      case 'create':
      case 'crear':
        description = `Usuario creado`;
        break;
      case 'update':
      case 'actualizar':
      case 'editar':
        if (resource.includes('user')) {
          description = 'Datos del usuario actualizados';
        } else if (resource.includes('profile')) {
          description = 'Perfil actualizado';
        } else {
          description = 'Información actualizada';
        }
        break;
      case 'delete':
      case 'eliminar':
        description = 'Usuario eliminado';
        break;
      case 'change_password':
      case 'cambiar_contraseña':
        description = 'Contraseña modificada';
        break;
      case 'update_permissions':
      case 'actualizar_permisos':
        description = 'Permisos actualizados';
        break;
      default:
        description = `Acción: ${log.action}`;
    }
    
    return description;
  };

  const formatChanges = (oldValues: any, newValues: any) => {
    if (!oldValues && !newValues) return null;
    
    const changes: string[] = [];
    
    if (newValues) {
      Object.keys(newValues).forEach(key => {
        if (key === 'password') {
          changes.push('Contraseña modificada');
        } else if (key === 'permissions') {
          changes.push('Permisos actualizados');
        } else if (oldValues && oldValues[key] !== newValues[key]) {
          changes.push(`${key}: "${oldValues[key] || 'vacío'}" → "${newValues[key] || 'vacío'}"`);
        } else if (!oldValues) {
          changes.push(`${key}: "${newValues[key]}"`);
        }
      });
    }
    
    return changes.length > 0 ? changes : null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <History sx={{ mr: 1 }} />
          Historial de Cambios - {user?.username}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && auditLogs.length === 0 && (
          <Alert severity="info">
            No hay historial de cambios registrado para este usuario.
          </Alert>
        )}

        {!loading && !error && auditLogs.length > 0 && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Historial completo de acciones realizadas sobre el usuario {user?.username}
            </Typography>
            
            <Timeline>
              {auditLogs.map((log, index) => {
                const changes = formatChanges(log.oldValues, log.newValues);
                const isLast = index === auditLogs.length - 1;
                
                return (
                  <TimelineItem key={log.id}>
                    <TimelineSeparator>
                      <TimelineDot 
                        color={getActionColor(log.action) as any}
                        variant="outlined"
                      >
                        {getActionIcon(log.action)}
                      </TimelineDot>
                      {!isLast && <TimelineConnector />}
                    </TimelineSeparator>
                    
                    <TimelineContent>
                      <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                          {/* Header */}
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6" sx={{ flexGrow: 1 }}>
                              {getActionDescription(log)}
                            </Typography>
                            <Chip
                              label={log.action}
                              color={getActionColor(log.action) as any}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          
                          {/* Fecha y usuario */}
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {formatDate(log.createdAt)}
                            {log.user && (
                              <> • Por: {log.user.firstName} {log.user.lastName} ({log.user.username})</>
                            )}
                          </Typography>
                          
                          {/* Cambios detallados */}
                          {changes && changes.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Divider sx={{ mb: 1 }} />
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Cambios realizados:
                              </Typography>
                              {changes.map((change, idx) => (
                                <Typography 
                                  key={idx} 
                                  variant="body2" 
                                  sx={{ 
                                    fontFamily: 'monospace',
                                    bgcolor: 'action.hover',
                                    p: 0.5,
                                    borderRadius: 1,
                                    mt: 0.5
                                  }}
                                >
                                  • {change}
                                </Typography>
                              ))}
                            </Box>
                          )}
                          
                          {/* Información técnica */}
                          {(log.ipAddress || log.userAgent) && (
                            <Box sx={{ mt: 2 }}>
                              <Divider sx={{ mb: 1 }} />
                              <Typography variant="caption" color="text.secondary">
                                {log.ipAddress && <>IP: {log.ipAddress}</>}
                                {log.ipAddress && log.userAgent && <> • </>}
                                {log.userAgent && <>Navegador: {log.userAgent.substring(0, 50)}...</>}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </TimelineContent>
                  </TimelineItem>
                );
              })}
            </Timeline>
          </>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} startIcon={<Close />}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}