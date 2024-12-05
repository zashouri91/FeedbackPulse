import { ReactNode } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Role, hasRole } from '@/lib/utils/rbac';
import { ErrorCard } from '@/components/ui/error-card';

interface RoleGateProps {
  children: ReactNode;
  allowedRoles: Role[];
  fallback?: ReactNode;
}

export function RoleGate({ children, allowedRoles, fallback }: RoleGateProps) {
  const { user } = useAuth();
  
  const hasAccess = allowedRoles.some(role => hasRole(user, role));
  
  if (!hasAccess) {
    return fallback || (
      <ErrorCard
        title="Access Denied"
        description="You don't have permission to access this resource."
      />
    );
  }
  
  return <>{children}</>;
}