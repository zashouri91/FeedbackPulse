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
import { useGroups } from '@/lib/hooks/use-groups';
import { useLocations } from '@/lib/hooks/use-locations';
import { useUsers } from '@/lib/hooks/use-users';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const groupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  manager_id: z.string().min(1, 'Manager is required'),
  location_id: z.string().min(1, 'Location is required'),
});

type GroupForm = z.infer<typeof groupSchema>;

export function GroupsTable() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { groups, isLoading, createGroup, updateGroup, deleteGroup } = useGroups();
  const { locations } = useLocations();
  const { users } = useUsers();
  const form = useForm<GroupForm>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      manager_id: '',
      location_id: '',
    },
  });

  const onSubmit = async (data: GroupForm) => {
    if (editingId) {
      await updateGroup.mutateAsync({ id: editingId, ...data });
    } else {
      await createGroup.mutateAsync(data);
    }
    setOpen(false);
    setEditingId(null);
    form.reset();
  };

  const handleEdit = (group: (typeof groups)[0]) => {
    setEditingId(group.id);
    form.reset({
      name: group.name,
      manager_id: group.manager_id,
      location_id: group.location_id,
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this group?')) {
      await deleteGroup.mutateAsync(id);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? groups.map(group => group.id) : []);
  };

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev => (checked ? [...prev, id] : prev.filter(i => i !== id)));
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedIds.length} groups?`)) {
      try {
        await Promise.all(selectedIds.map(id => deleteGroup.mutateAsync(id)));
        setSelectedIds([]);
        toast.success(`Successfully deleted ${selectedIds.length} groups`);
      } catch (error) {
        console.error('Error deleting groups:', error);
        toast.error('Failed to delete some groups');
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Groups</h2>
          {selectedIds.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleDeleteSelected} className="h-8">
              Delete Selected ({selectedIds.length})
            </Button>
          )}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Group' : 'Add Group'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter group name" {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map(location => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="manager_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manager</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select manager" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
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
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedIds.length === groups.length}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map(group => (
            <TableRow key={group.id}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(group.id)}
                  onCheckedChange={checked => handleSelect(group.id, !!checked)}
                  aria-label={`Select ${group.name}`}
                />
              </TableCell>
              <TableCell>{group.name}</TableCell>
              <TableCell>{locations.find(l => l.id === group.location_id)?.name}</TableCell>
              <TableCell>{users.find(u => u.id === group.manager_id)?.email}</TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(group)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil2Icon className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(group.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
