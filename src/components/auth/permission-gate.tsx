import { ReactNode } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Permission, hasPermission } from '@/lib/utils/rbac';
import { ErrorCard } from '@/components/ui/error-card';

interface PermissionGateProps {
  children: ReactNode;
  permission: Permission;
  fallback?: ReactNode;
}

export function PermissionGate({ children, permission, fallback }: PermissionGateProps) {
  const { user } = useAuth();
  
  if (!hasPermission(user, permission)) {
    return fallback || (
      <ErrorCard
        title="Access Denied"
        description="You don't have permission to perform this action."
      />
    );
  }
  
  return <>{children}</>;
}