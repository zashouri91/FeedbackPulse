import { useQuery } from '@tanstack/react-query';
import * as auditApi from '@/lib/api/audit-logs';
import { usePermissions } from '@/hooks/use-permissions';

export function useAuditLogs(options?: Parameters<typeof auditApi.getAuditLogs>[0]) {
  const { hasRole } = usePermissions();
  const canViewAuditLogs = hasRole('admin') || hasRole('super_admin');

  const query = useQuery({
    queryKey: ['audit-logs', options],
    queryFn: () => auditApi.getAuditLogs(options),
    enabled: canViewAuditLogs,
  });

  return {
    logs: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
