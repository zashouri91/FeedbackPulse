import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusIcon } from 'lucide-react';
import { useSurveys } from '@/lib/hooks/use-surveys';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PermissionGate } from '@/components/auth/permission-gate';

const surveySchema = z.object({
  assignee_id: z.string().min(1, 'Assignee is required'),
  group_id: z.string().min(1, 'Group is required'),
  location_id: z.string().min(1, 'Location is required'),
});

type SurveyForm = z.infer<typeof surveySchema>;

export function CreateSurvey() {
  const [open, setOpen] = useState(false);
  const { createSurvey } = useSurveys();
  
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
                name="assignee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <FormControl>
                      <Input placeholder="Select assignee" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="group_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group</FormLabel>
                    <FormControl>
                      <Input placeholder="Select group" {...field} />
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
                      <Input placeholder="Select location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createSurvey.isPending}>
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