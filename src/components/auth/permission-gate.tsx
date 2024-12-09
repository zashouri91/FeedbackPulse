import { ReactNode } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Permission, hasPermission } from '@/lib/utils/rbac';
import { ErrorCard } from '@/components/ui/error-card';

/**
 * Props for the PermissionGate component.
 */
interface PermissionGateProps {
  /**
   * The permissions required to access the content.
   */
  requiredPermissions: Permission[];
  /**
   * Whether all permissions are required (AND) or just one (OR).
   */
  requireAll?: boolean;
  /**
   * The content to render if the user has the required permissions.
   */
  children: ReactNode;
  /**
   * Component to render if the user doesn't have the required permissions.
   */
  fallback?: ReactNode;
}

export function PermissionGate({ 
  requiredPermissions, 
  requireAll = true,
  children, 
  fallback = null 
}: PermissionGateProps) {
  const { user } = useAuth();

  const hasRequiredPermissions = requireAll
    ? requiredPermissions.every(permission => hasPermission(user, permission))
    : requiredPermissions.some(permission => hasPermission(user, permission));

  if (!hasRequiredPermissions) {
    return (
      fallback || (
        <ErrorCard
          title="Access Denied"
          description="You don't have permission to perform this action."
        />
      )
    );
  }

  return <>{children}</>;
}
