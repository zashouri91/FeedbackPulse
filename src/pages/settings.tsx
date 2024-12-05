import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuditLogViewer } from '@/components/audit/audit-log-viewer';
import { RoleGate } from '@/components/auth/role-gate';
import { ProfileSettings } from '@/components/settings/profile-settings';
import { NotificationSettings } from '@/components/settings/notification-settings';
import { SecuritySettings } from '@/components/settings/security-settings';

export function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <RoleGate allowedRoles={['admin', 'super_admin']}>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </RoleGate>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>

        <TabsContent value="audit">
          <RoleGate allowedRoles={['admin', 'super_admin']}>
            <AuditLogViewer />
          </RoleGate>
        </TabsContent>
      </Tabs>
    </div>
  );
}