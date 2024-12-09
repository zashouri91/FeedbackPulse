import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PlusIcon } from 'lucide-react';
import { useSurveys } from '@/lib/hooks/use-surveys';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PermissionGate } from '@/components/auth/permission-gate';
import { useSurveySelectors } from '@/lib/hooks/use-survey-selectors';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const surveySchema = z.object({
  assignee_id: z.string().min(1, 'Assignee is required'),
  group_id: z.string().min(1, 'Group is required'),
  location_id: z.string().min(1, 'Location is required'),
});

type SurveyForm = z.infer<typeof surveySchema>;

export function CreateSurvey() {
  const [open, setOpen] = useState(false);
  const { createSurvey } = useSurveys();
  const {
    groups,
    locations,
    assignees,
    selectedGroups,
    selectedLocations,
    handleGroupsChange,
    handleLocationsChange,
    loading,
  } = useSurveySelectors();

  const form = useForm<SurveyForm>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      assignee_id: '',
      group_id: '',
      location_id: '',
    },
  });

  const onSubmit = async (data: SurveyForm) => {
    await createSurvey.mutateAsync(data);
    setOpen(false);
    form.reset();
    handleGroupsChange([]);
    handleLocationsChange([]);
  };

  return (
    <PermissionGate permission={{ action: 'create', subject: 'survey' }}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Survey
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Survey</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="group_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group</FormLabel>
                    <Select
                      disabled={loading}
                      onValueChange={value => {
                        field.onChange(value);
                        handleGroupsChange([value]);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {groups.map(group => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
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
                name="location_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select
                      disabled={!selectedGroups.length || loading}
                      onValueChange={value => {
                        field.onChange(value);
                        handleLocationsChange([value]);
                      }}
                      value={field.value}
                    >
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
                name="assignee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <Select
                      disabled={!selectedLocations.length || loading}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assignees.map(assignee => (
                          <SelectItem key={assignee.id} value={assignee.id}>
                            {assignee.first_name} {assignee.last_name}
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
                    form.reset();
                    handleGroupsChange([]);
                    handleLocationsChange([]);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createSurvey.isPending || loading}>
                  Create
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </PermissionGate>
  );
}
