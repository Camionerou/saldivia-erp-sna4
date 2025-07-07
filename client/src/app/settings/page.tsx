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
  TextField,
  Switch,
  FormControlLabel,
  IconButton,
  AppBar,
  Toolbar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Settings,
  Business,
  Security,
  Notifications,
  Backup,
  Edit,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import api from '@/services/authService';

interface SystemSettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  cuit: string;
  taxRegime: string;
  enableNotifications: boolean;
  enableBackup: boolean;
  backupFrequency: string;
  sessionTimeout: number;
  maxLoginAttempts: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SystemSettings>({
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    cuit: '',
    taxRegime: '',
    enableNotifications: true,
    enableBackup: true,
    backupFrequency: 'daily',
    sessionTimeout: 1440,
    maxLoginAttempts: 3,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/api/system/settings');
        setSettings(response.data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/api/system/settings', settings);
      // Mostrar mensaje de éxito
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof SystemSettings) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
          <Settings sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Configuración del Sistema
          </Typography>
          <Button 
            color="inherit" 
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        <Grid container spacing={3}>
          {/* Información de la Empresa */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Business sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Información de la Empresa
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Razón Social"
                      value={settings.companyName}
                      onChange={handleChange('companyName')}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Dirección"
                      value={settings.companyAddress}
                      onChange={handleChange('companyAddress')}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Teléfono"
                      value={settings.companyPhone}
                      onChange={handleChange('companyPhone')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={settings.companyEmail}
                      onChange={handleChange('companyEmail')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="CUIT"
                      value={settings.cuit}
                      onChange={handleChange('cuit')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Régimen Fiscal"
                      value={settings.taxRegime}
                      onChange={handleChange('taxRegime')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Configuración de Seguridad */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Security sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Configuración de Seguridad
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Tiempo de Sesión (minutos)"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={handleChange('sessionTimeout')}
                      helperText="Tiempo en minutos antes de cerrar sesión automáticamente"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Máximo Intentos de Login"
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={handleChange('maxLoginAttempts')}
                      helperText="Número máximo de intentos de login antes de bloquear"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Configuración del Sistema */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Configuración del Sistema
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Notificaciones"
                      secondary="Habilitar notificaciones del sistema"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.enableNotifications}
                        onChange={handleChange('enableNotifications')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Respaldo Automático"
                      secondary="Habilitar respaldo automático de datos"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.enableBackup}
                        onChange={handleChange('enableBackup')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Frecuencia de Respaldo"
                      secondary="Configurar frecuencia de respaldo automático"
                    />
                    <ListItemSecondaryAction>
                      <TextField
                        select
                        size="small"
                        value={settings.backupFrequency}
                        onChange={handleChange('backupFrequency')}
                        SelectProps={{
                          native: true,
                        }}
                      >
                        <option value="daily">Diario</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensual</option>
                      </TextField>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Información del Sistema */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Información del Sistema
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Versión del Sistema
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      ERP Saldivia v1.0.0
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Base de Datos
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      MySQL 8.0
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Último Respaldo
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {new Date().toLocaleDateString('es-AR')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Estado del Sistema
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="success.main">
                      Operativo
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 