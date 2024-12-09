import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LocationsTable } from '@/components/management/locations-table';
import { GroupsTable } from '@/components/management/groups-table';
import { UsersTable } from '@/components/management/users-table';
import { RoleGate } from '@/components/auth/role-gate';

export default function ManagementPage() {
  return (
    <RoleGate allowedRoles={['admin', 'super_admin']}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Management</h1>

        <Tabs defaultValue="locations">
          <TabsList>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="locations">
            <LocationsTable />
          </TabsContent>

          <TabsContent value="groups">
            <GroupsTable />
          </TabsContent>

          <TabsContent value="users">
            <UsersTable />
          </TabsContent>
        </Tabs>
      </div>
    </RoleGate>
  );
}
