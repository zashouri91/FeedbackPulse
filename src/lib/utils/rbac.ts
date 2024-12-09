import { User } from '@supabase/supabase-js';

export type Role = 'super_admin' | 'admin' | 'manager' | 'user';

export interface Permission {
  action: string;
  subject: string;
}

const roleHierarchy: Record<Role, number> = {
  super_admin: 4,
  admin: 3,
  manager: 2,
  user: 1,
};

const permissions: Record<Role, Permission[]> = {
  super_admin: [{ action: '*', subject: '*' }],
  admin: [
    { action: 'create', subject: '*' },
    { action: 'read', subject: '*' },
    { action: 'update', subject: '*' },
    { action: 'delete', subject: '*' },
  ],
  manager: [
    { action: 'create', subject: 'survey' },
    { action: 'read', subject: 'survey' },
    { action: 'update', subject: 'survey' },
    { action: 'read', subject: 'response' },
    { action: 'read', subject: 'group' },
    { action: 'update', subject: 'group' },
  ],
  user: [
    { action: 'read', subject: 'survey' },
    { action: 'create', subject: 'response' },
    { action: 'read', subject: 'response' },
  ],
};

export function hasRole(user: User | null, requiredRole: Role): boolean {
  if (!user) return false;

  const userRole = getUserRole(user);
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false;

  const userRole = getUserRole(user);
  const userPermissions = permissions[userRole];

  return userPermissions.some(
    p =>
      (p.action === '*' && p.subject === '*') ||
      (p.action === '*' && p.subject === permission.subject) ||
      (p.action === permission.action && p.subject === '*') ||
      (p.action === permission.action && p.subject === permission.subject)
  );
}

export function getUserRole(user: User): Role {
  return (user.user_metadata.role as Role) || 'user';
}
