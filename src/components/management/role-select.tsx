import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Role } from '@/lib/utils/rbac';
import { usePermissions } from '@/hooks/use-permissions';

const roles: { value: Role; label: string }[] = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'user', label: 'User' },
];

interface RoleSelectProps {
  value: Role;
  onChange: (value: Role) => void;
  disabled?: boolean;
}

export function RoleSelect({ value, onChange, disabled }: RoleSelectProps) {
  const { hasRole } = usePermissions();
  const canAssignRole = (role: Role) => hasRole('super_admin') || 
    (hasRole('admin') && role !== 'super_admin');

  return (
    <Select
      value={value}
      onValueChange={onChange as (value: string) => void}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => (
          canAssignRole(role.value) && (
            <SelectItem key={role.value} value={role.value}>
              {role.label}
            </SelectItem>
          )
        ))}
      </SelectContent>
    </Select>
  );
}