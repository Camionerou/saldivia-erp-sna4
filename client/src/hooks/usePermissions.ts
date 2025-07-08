import { useAuth } from '@/contexts/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();

  const getUserPermissions = (): string[] => {
    if (!user?.profile) return [];
    
    if (typeof user.profile === 'string') {
      // Si el perfil es solo un string, asignar permisos básicos según el nombre
      if ((user.profile as string).toLowerCase().includes('admin')) {
        return ['all'];
      }
      return ['dashboard'];
    }
    
    // Si el perfil es un objeto, usar los permisos definidos
    return user.profile.permissions || [];
  };

  const hasPermission = (permission: string): boolean => {
    const permissions = getUserPermissions();
    
    // Si tiene permiso 'all', tiene acceso a todo
    if (permissions.includes('all')) return true;
    
    // Verificar permiso específico
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionList: string[]): boolean => {
    return permissionList.some(permission => hasPermission(permission));
  };

  // Funciones específicas para diferentes acciones
  const canCreateUsers = (): boolean => {
    return hasAnyPermission(['all', 'admin', 'users.write']);
  };

  const canEditUsers = (): boolean => {
    return hasAnyPermission(['all', 'admin', 'users.write']);
  };

  const canDeleteUsers = (): boolean => {
    return hasAnyPermission(['all', 'admin', 'users.delete']);
  };

  const canManagePermissions = (): boolean => {
    return hasAnyPermission(['all', 'admin', 'users.permissions']);
  };

  const canChangePasswords = (): boolean => {
    return hasAnyPermission(['all', 'admin', 'users.password']);
  };

  const canViewHistory = (): boolean => {
    return hasAnyPermission(['all', 'admin', 'users.history']);
  };

  const canExportData = (): boolean => {
    return hasAnyPermission(['all', 'admin', 'users.export']);
  };

  const canAccessModule = (module: string): boolean => {
    return hasAnyPermission(['all', 'admin', module]);
  };

  const isAdmin = (): boolean => {
    return hasAnyPermission(['all', 'admin']);
  };

  return {
    hasPermission,
    hasAnyPermission,
    canCreateUsers,
    canEditUsers,
    canDeleteUsers,
    canManagePermissions,
    canChangePasswords,
    canViewHistory,
    canExportData,
    canAccessModule,
    isAdmin,
    getUserPermissions
  };
}; 