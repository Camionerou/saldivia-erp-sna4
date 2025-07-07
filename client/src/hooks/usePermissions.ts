import { useAuth } from '../contexts/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!user?.profile?.permissions) {
      return false;
    }

    const permissions = user.profile.permissions;
    
    // Verificar si tiene el permiso específico, 'all' o 'admin'
    return permissions.includes(permission) || 
           permissions.includes('all') || 
           permissions.includes('admin') ||
           permissions.includes('ADMIN');
  };

  const isAdmin = (): boolean => {
    if (!user?.profile?.permissions) {
      return false;
    }

    const permissions = user.profile.permissions;
    
    return permissions.includes('all') || 
           permissions.includes('admin') ||
           permissions.includes('ADMIN');
  };

  const canManageUsers = (): boolean => {
    return hasPermission('users.write') || isAdmin();
  };

  const canViewUsers = (): boolean => {
    return hasPermission('users.read') || isAdmin();
  };

  const canManagePermissions = (): boolean => {
    return isAdmin(); // Solo admin puede gestionar permisos
  };

  const canCreateUsers = (): boolean => {
    return isAdmin(); // Solo admin puede crear usuarios
  };

  const canDeleteUsers = (): boolean => {
    return isAdmin(); // Solo admin puede eliminar usuarios
  };

  const canChangePasswords = (): boolean => {
    return hasPermission('users.password') || isAdmin();
  };

  const canViewHistory = (): boolean => {
    return hasPermission('users.history') || isAdmin();
  };

  const canExportData = (): boolean => {
    return hasPermission('users.export') || isAdmin();
  };

  return {
    hasPermission,
    isAdmin,
    canManageUsers,
    canViewUsers,
    canManagePermissions,
    canCreateUsers,
    canDeleteUsers,
    canChangePasswords,
    canViewHistory,
    canExportData,
    user
  };
};

export default usePermissions; 