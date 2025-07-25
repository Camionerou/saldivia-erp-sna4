import React, { useState, useRef, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Avatar,
  Box,
  Grid,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import {
  PhotoCamera,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileManagerProps {
  open: boolean;
  onClose: () => void;
  onUpdateProfile: (data: FormData) => Promise<any>;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
}

const ProfileManager: React.FC<ProfileManagerProps> = ({
  open,
  onClose,
  onUpdateProfile
}) => {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    department: '',
    position: ''
  });

  // Actualizar datos cuando cambie el usuario o se abra el modal
  React.useEffect(() => {
    if (open && user) {
      // SOLUCIÓN RADICAL: Cargar imagen actual como imagen temporal
      if (user?.profile && typeof user.profile === 'object' && user.profile.profileImage) {
        let imageUrl = user.profile.profileImage;
        
        // Si no es una URL completa, construir la URL base
        if (!imageUrl.startsWith('http')) {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          imageUrl = `${baseUrl}${imageUrl}`;
        }
        
        // Limpiar timestamps existentes antes de agregar uno nuevo
        imageUrl = imageUrl.split('?t=')[0];
        const finalUrl = `${imageUrl}?t=${Date.now()}`;
        
        // CARGAR LA IMAGEN ACTUAL COMO TEMPORAL
        fetch(finalUrl)
          .then(response => response.blob())
          .then(blob => {
            const reader = new FileReader();
            reader.onload = (e) => {
              setProfileImage(e.target?.result as string);
              console.log('Imagen actual cargada como temporal');
            };
            reader.readAsDataURL(blob);
          })
          .catch(() => {
            console.log('No se pudo cargar imagen actual');
            setProfileImage(null);
          });
      } else {
        setProfileImage(null);
      }
      
      // Actualizar formData con datos del usuario y perfil extendido
      setFormData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: (user?.profile && typeof user.profile === 'object' && user.profile.phone) || '',
        department: (user?.profile && typeof user.profile === 'object' && user.profile.department) || '',
        position: (user?.profile && typeof user.profile === 'object' && user.profile.position) || ''
      });
      
      // Resetear estados
      setError('');
      setSuccess(false);
      setIsEditing(false);
    }
  }, [open, user?.profile?.profileImage, user?.firstName, user?.lastName, user?.email]);

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
      setIsSaving(true);
      setError('');

      const formDataToSend = new FormData();
      
      // Agregar datos del perfil
      Object.entries(formData).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          formDataToSend.append(key, value);
        }
      });

      // Agregar imagen si hay una nueva
      if (fileInputRef.current?.files?.[0]) {
        formDataToSend.append('profileImage', fileInputRef.current.files[0]);
      }

      const response = await onUpdateProfile(formDataToSend);
      
      // SOLUCIÓN RADICAL: Si hay nueva imagen, NO limpiar la imagen temporal
      if (fileInputRef.current?.files?.[0] && response?.data?.profileImage) {
        // NO TOCAR setProfileImage(null) - mantener la imagen temporal
        console.log('IMAGEN GUARDADA - MANTENIENDO PREVIEW');
        
        // Actualizar contexto pero SIN limpiar imagen temporal
        if (user?.profile) {
          updateUserProfile({
            profile: {
              ...user.profile,
              profileImage: response.data.profileImage
            }
          });
        }
      }
      
      setSuccess(true);
      setIsEditing(false);
      
      // Limpiar la referencia del archivo después de guardar
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // NO LIMPIAR LA IMAGEN TEMPORAL - DEJARLA PERMANENTE
      // setProfileImage(null); // COMENTADO PARA SIEMPRE
      
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);

    } catch (err: any) {
      console.error('Error al actualizar perfil:', err);
      setError(err.response?.data?.error || err.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
      setIsSaving(false);
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
    // NO LIMPIAR LA IMAGEN - setProfileImage(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Mi Perfil</Typography>
          {!isEditing && (
            <IconButton onClick={() => setIsEditing(true)} color="primary">
              <EditIcon />
            </IconButton>
          )}
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
            Perfil actualizado correctamente
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Foto de perfil */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box position="relative" display="inline-block">
                  <Avatar
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      mb: 2,
                      fontSize: '2rem',
                      bgcolor: 'primary.main'
                    }}
                    src={profileImage || undefined}
                    key={`avatar-ALWAYS-TEMP-${profileImage ? 'HAS-IMAGE' : 'NO-IMAGE'}-${Date.now()}`}
                  >
                    {!profileImage && getInitials()}
                  </Avatar>
                  
                  {isEditing && (
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: -8,
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

                <Typography variant="h6">
                  {formData.firstName} {formData.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  @{user?.username}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Información del perfil */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Información del sistema */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Información del Sistema
                </Typography>
                
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Perfil: {typeof user?.profile === 'string' ? user.profile : user?.profile?.name || 'Sin perfil'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID de Usuario: {user?.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nombre de Usuario: {user?.username}
                  </Typography>
                </Box>

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
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        {isEditing ? (
          <>
            <Button onClick={handleCancel} disabled={loading}>
              <CancelIcon sx={{ mr: 1 }} />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={20} />
              ) : (
                <>
                  <SaveIcon sx={{ mr: 1 }} />
                  Guardar
                </>
              )}
            </Button>
          </>
        ) : (
          <Button onClick={onClose}>
            Cerrar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProfileManager; 