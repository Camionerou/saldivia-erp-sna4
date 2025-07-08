import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Security,
  VpnKey,
  History,
  Delete
} from '@mui/icons-material';
import { User } from '@/types/user';
import { usePermissions } from '@/hooks/usePermissions';

interface UserActionsMenuProps {
  user: User;
  onEdit: (user: User) => void;
  onManagePermissions: (user: User) => void;
  onChangePassword: (user: User) => void;
  onViewHistory: (user: User) => void;
  onDelete: (user: User) => void;
}

const UserActionsMenu: React.FC<UserActionsMenuProps> = ({
  user,
  onEdit,
  onManagePermissions,
  onChangePassword,
  onViewHistory,
  onDelete
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const permissions = usePermissions();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: () => void) => {
    action();
    handleClose();
  };

  // Verificar si el usuario tiene al menos una acción disponible
  const hasActions = permissions.canEditUsers() || 
                     permissions.canManagePermissions() || 
                     permissions.canChangePasswords() || 
                     permissions.canViewHistory() || 
                     permissions.canDeleteUsers();

  if (!hasActions) {
    return null;
  }

  return (
    <>
      <Tooltip title="Acciones">
        <IconButton
          size="small"
          onClick={handleClick}
          sx={{ 
            color: 'text.secondary',
            '&:hover': { 
              color: 'primary.main',
              backgroundColor: 'action.hover'
            }
          }}
        >
          <MoreVert />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {permissions.canEditUsers() && (
          <MenuItem onClick={() => handleAction(() => onEdit(user))}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Editar usuario</ListItemText>
          </MenuItem>
        )}

        {permissions.canManagePermissions() && (
          <MenuItem onClick={() => handleAction(() => onManagePermissions(user))}>
            <ListItemIcon>
              <Security fontSize="small" />
            </ListItemIcon>
            <ListItemText>Gestionar permisos</ListItemText>
          </MenuItem>
        )}

        {permissions.canChangePasswords() && (
          <MenuItem onClick={() => handleAction(() => onChangePassword(user))}>
            <ListItemIcon>
              <VpnKey fontSize="small" />
            </ListItemIcon>
            <ListItemText>Cambiar contraseña</ListItemText>
          </MenuItem>
        )}

        {permissions.canViewHistory() && (
          <MenuItem onClick={() => handleAction(() => onViewHistory(user))}>
            <ListItemIcon>
              <History fontSize="small" />
            </ListItemIcon>
            <ListItemText>Ver historial</ListItemText>
          </MenuItem>
        )}

        {permissions.canDeleteUsers() && (
          <>
            <Divider />
            <MenuItem 
              onClick={() => handleAction(() => onDelete(user))}
              sx={{ 
                color: 'error.main',
                '&:hover': { 
                  backgroundColor: 'error.light',
                  color: 'error.contrastText'
                }
              }}
            >
              <ListItemIcon>
                <Delete fontSize="small" sx={{ color: 'inherit' }} />
              </ListItemIcon>
              <ListItemText>Eliminar usuario</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
};

export default UserActionsMenu; 