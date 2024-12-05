import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PlusIcon, Pencil2Icon, TrashIcon } from '@radix-ui/react-icons';
import { useUsers } from '@/lib/hooks/use-users';
import { useLocations } from '@/lib/hooks/use-locations';
import { useGroups } from '@/lib/hooks/use-groups';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema } from '@/lib/utils/validation';
import { RoleSelect } from './role-select';
import { usePermissions } from '@/hooks/use-permissions';
import { Role } from '@/lib/utils/rbac';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

type UserForm = {
  email: string;
  role: Role;
  location_id: string;
  groups: string[];
};

export function UsersTable() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { users, isLoading, createUser, updateUser, deleteUser } = useUsers();
  const { locations } = useLocations();
  const { groups } = useGroups();
  const { hasRole } = usePermissions();

  const form = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: '',
      role: 'user',
      location_id: '',
      groups: [],
    },
  });

  const onSubmit = async (data: UserForm) => {
    try {
      if (editingId) {
        await updateUser.mutateAsync({ id: editingId, ...data });
      } else {
        console.log('Creating user with data:', data);
        const result = await createUser.mutateAsync(data);
        console.log('User creation result:', result);
      }
      setOpen(false);
      setEditingId(null);
      form.reset();
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };

  const handleEdit = (user: typeof users[0]) => {
    setEditingId(user.id);
    form.reset({
      email: user.email,
      role: user.role as Role,
      location_id: user.location_id,
      groups: user.groups,
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteUser.mutateAsync(id);
  };

  const canManageUsers = hasRole('admin') || hasRole('super_admin');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Users</h2>
        {canManageUsers && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit User' : 'Add User'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter email address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <RoleSelect
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <select
                            className="w-full rounded-md border border-input bg-background px-3 py-2"
                            value={field.value}
                            onChange={field.onChange}
                          >
                            <option value="">Select a location</option>
                            {locations.map((location) => (
                              <option key={location.id} value={location.id}>
                                {location.name}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="groups"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Groups</FormLabel>
                        <FormControl>
                          <select
                            className="w-full rounded-md border border-input bg-background px-3 py-2"
                            multiple
                            value={field.value}
                            onChange={(e) => {
                              const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                              field.onChange(selectedOptions);
                            }}
                          >
                            {groups.map((group) => (
                              <option key={group.id} value={group.id}>
                                {group.name}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                        <div className="text-xs text-muted-foreground">
                          Hold Ctrl/Cmd to select multiple groups
                        </div>
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setOpen(false);
                        setEditingId(null);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Groups</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                {locations.find((l) => l.id === user.location_id)?.name}
              </TableCell>
              <TableCell>{user.groups.length} groups</TableCell>
              <TableCell>
                {canManageUsers && (
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(user)}
                    >
                      <Pencil2Icon className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this user? This action
                            cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(user.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}