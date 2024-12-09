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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

type UserForm = {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: Role;
  location_id: string;
  groups: string[];
};

export function UsersTable() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { users, isLoading, createUser, updateUser, deleteUser } = useUsers();
  const { locations } = useLocations();
  const { groups } = useGroups();
  const { hasRole } = usePermissions();

  const form = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
      phone_number: '',
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

  const handleEdit = (user: (typeof users)[0]) => {
    setEditingId(user.id);
    form.reset({
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone_number: user.phone_number || '',
      role: user.role as Role,
      location_id: user.location_id,
      groups: user.groups,
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteUser.mutateAsync(id);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? users.map(user => user.id) : []);
  };

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev => (checked ? [...prev, id] : prev.filter(i => i !== id)));
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedIds.length} users?`)) {
      try {
        await Promise.all(selectedIds.map(id => deleteUser.mutateAsync(id)));
        setSelectedIds([]);
        toast.success(`Successfully deleted ${selectedIds.length} users`);
      } catch (error) {
        console.error('Error deleting users:', error);
        toast.error('Failed to delete some users');
      }
    }
  };

  const canManageUsers = hasRole('admin') || hasRole('super_admin');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Users</h2>
          {selectedIds.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleDeleteSelected} className="h-8">
              Delete Selected ({selectedIds.length})
            </Button>
          )}
        </div>
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
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="Enter phone number" {...field} />
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
                          <RoleSelect value={field.value} onChange={field.onChange} />
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
                            {locations.map(location => (
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
                            onChange={e => {
                              const selectedOptions = Array.from(
                                e.target.selectedOptions,
                                option => option.value
                              );
                              field.onChange(selectedOptions);
                            }}
                          >
                            {groups.map(group => (
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
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedIds.length === users.length}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Groups</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.id}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(user.id)}
                  onCheckedChange={checked => handleSelect(user.id, !!checked)}
                  aria-label={`Select ${user.email}`}
                />
              </TableCell>
              <TableCell>
                {user.first_name} {user.last_name}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone_number}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>{locations.find(l => l.id === user.location_id)?.name}</TableCell>
              <TableCell>{user.groups.length} groups</TableCell>
              <TableCell>
                {canManageUsers && (
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(user)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil2Icon className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <TrashIcon className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this user? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(user.id)}>
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
