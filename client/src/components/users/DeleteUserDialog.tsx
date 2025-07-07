import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { User } from '../../types/user';

interface DeleteUserDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  user: User | null;
  isLoading?: boolean;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  open,
  onClose,
  onConfirm,
  user,
  isLoading = false
}) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // El error se maneja en el componente padre
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirmar Eliminación</DialogTitle>
      
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Esta acción no se puede deshacer
        </Alert>
        
        <Typography variant="body1" gutterBottom>
          ¿Está seguro que desea eliminar el usuario <strong>{user.username}</strong>?
        </Typography>
        
        {user.firstName && user.lastName && (
          <Typography variant="body2" color="text.secondary">
            {user.firstName} {user.lastName}
          </Typography>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Se eliminarán permanentemente:
        </Typography>
        <ul>
          <li>Información del usuario</li>
          <li>Perfil asignado</li>
          <li>Sesiones activas</li>
          <li>Historial de auditoría relacionado</li>
        </ul>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={20} />
          ) : (
            'Eliminar'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteUserDialog; 