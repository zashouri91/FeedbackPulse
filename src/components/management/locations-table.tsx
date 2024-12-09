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
import { PlusIcon, Pencil2Icon, TrashIcon } from '@radix-ui/react-icons';
import { useLocations } from '@/lib/hooks/use-locations';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const locationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  managers: z.array(z.string()),
});

type LocationForm = z.infer<typeof locationSchema>;

export function LocationsTable() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { locations, isLoading, createLocation, updateLocation, deleteLocation } = useLocations();

  const form = useForm<LocationForm>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      managers: [],
    },
  });

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    form.reset();
  };

  const onSubmit = async (data: LocationForm) => {
    try {
      if (editingId) {
        await updateLocation.mutateAsync({ id: editingId, ...data });
      } else {
        await createLocation.mutateAsync(data);
      }
      handleClose();
    } catch (error) {
      console.error('Error submitting location:', error);
    }
  };

  const handleEdit = (location: (typeof locations)[0]) => {
    setEditingId(location.id);
    form.reset({
      name: location.name,
      managers: location.managers,
    });
    setOpen(true);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? locations.map(location => location.id) : []);
  };

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev => (checked ? [...prev, id] : prev.filter(i => i !== id)));
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedIds.length} locations?`)) {
      try {
        await Promise.all(selectedIds.map(id => deleteLocation.mutateAsync(id)));
        setSelectedIds([]);
        toast.success(`Successfully deleted ${selectedIds.length} locations`);
      } catch (error) {
        console.error('Error deleting locations:', error);
        toast.error('Failed to delete some locations');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this location?')) {
      await deleteLocation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Locations</h2>
          {selectedIds.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleDeleteSelected} className="h-8">
              Delete Selected ({selectedIds.length})
            </Button>
          )}
        </div>
        <Dialog
          open={open}
          onOpenChange={isOpen => {
            if (!isOpen) {
              handleClose();
            } else {
              setOpen(true);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Location' : 'Add Location'}</DialogTitle>
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
                        <Input placeholder="Enter location name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={handleClose}>
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
                checked={selectedIds.length === locations.length}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Managers</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.map(location => (
            <TableRow key={location.id}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(location.id)}
                  onCheckedChange={checked => handleSelect(location.id, !!checked)}
                  aria-label={`Select ${location.name}`}
                />
              </TableCell>
              <TableCell>{location.name}</TableCell>
              <TableCell>{location.managers.length}</TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(location)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil2Icon className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(location.id)}
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
