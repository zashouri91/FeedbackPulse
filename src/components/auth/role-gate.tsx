import { ReactNode } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Role, hasRole } from '@/lib/utils/rbac';
import { ErrorCard } from '@/components/ui/error-card';

/**
 * Props for the RoleGate component.
 */
interface RoleGateProps {
  /**
   * The roles that are allowed to access the content.
   */
  allowedRoles: string[];
  /**
   * The content to render if the user has the required role.
   */
  children: React.ReactNode;
  /**
   * Component to render if the user doesn't have the required role.
   */
  fallback?: React.ReactNode;
}

/**
 * A component that conditionally renders its children based on the user's role.
 */
export function RoleGate({ allowedRoles, children, fallback = null }: RoleGateProps) {
  const { user } = useAuth();

  const hasAccess = allowedRoles.some(role => hasRole(user, role));

  if (!hasAccess) {
    return (
      fallback || (
        <ErrorCard
          title="Access Denied"
          description="You don't have permission to access this resource."
        />
      )
    );
  }

  return <>{children}</>;
}
