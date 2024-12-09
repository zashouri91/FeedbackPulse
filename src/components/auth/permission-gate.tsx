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
  requiredPermissions: string[];
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

  if (!requiredPermissions.every(permission => hasPermission(user, permission as Permission))) {
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
