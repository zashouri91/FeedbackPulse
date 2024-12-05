import { useAuth } from '@/components/auth-provider';
import { Permission, hasPermission, hasRole, Role } from '@/lib/utils/rbac';

export function usePermissions() {
  const { user } = useAuth();
  
  return {
    can: (permission: Permission) => hasPermission(user, permission),
    hasRole: (role: Role) => hasRole(user, role),
    isAuthenticated: !!user,
  };
}