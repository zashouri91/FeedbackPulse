import { useState } from 'react';
import { useAuditLogs } from '@/lib/hooks/use-audit-logs';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDateTime } from '@/lib/utils/date';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

const PAGE_SIZE = 10;

export function AuditLogViewer() {
  const [page, setPage] = useState(0);
  const [selectedAction, setSelectedAction] = useState<string | undefined>();
  
  const { logs, isLoading } = useAuditLogs({
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
    action: selectedAction as any,
  });

  const actionColor: Record<string, string> = {
    created: 'bg-green-100 text-green-800',
    updated: 'bg-blue-100 text-blue-800',
    deleted: 'bg-red-100 text-red-800',
    changed: 'bg-yellow-100 text-yellow-800',
    submitted: 'bg-purple-100 text-purple-800',
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Audit Logs</h2>
        <Select
          value={selectedAction}
          onValueChange={setSelectedAction}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={undefined}>All actions</SelectItem>
            <SelectItem value="user.created">User Created</SelectItem>
            <SelectItem value="role.changed">Role Changed</SelectItem>
            <SelectItem value="survey.created">Survey Created</SelectItem>
            {/* Add more actions as needed */}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap">
                {formatDateTime(log.created_at)}
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    actionColor[
                      log.action.split('.')[1] as keyof typeof actionColor
                    ]
                  }
                >
                  {log.action}
                </Badge>
              </TableCell>
              <TableCell>{log.user_email}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {log.user_role}
                </Badge>
              </TableCell>
              <TableCell>
                <pre className="text-sm">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          <ChevronLeftIcon className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page + 1}
        </span>
        <Button
          variant="outline"
          onClick={() => setPage((p) => p + 1)}
          disabled={logs.length < PAGE_SIZE}
        >
          Next
          <ChevronRightIcon className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </Card>
  );
}