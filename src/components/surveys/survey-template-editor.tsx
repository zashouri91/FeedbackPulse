import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { surveySchema } from '@/lib/schemas/survey';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGroups } from '@/lib/hooks/use-groups';
import { useUsers } from '@/lib/hooks/use-users';
import { useLocations } from '@/lib/hooks/use-locations';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SurveyTemplateEditorProps {
  /** Callback function called when the template is successfully saved or updated */
  onSuccess?: () => void;
  /** Initial template data for editing. If null, creates a new template */
  initialData?: SurveyTemplate | null;
}

export function SurveyTemplateEditor({ onSuccess, initialData = null }: SurveyTemplateEditorProps) {
  const { groups, isLoading: isLoadingGroups } = useGroups();
  const { users, isLoading: isLoadingUsers } = useUsers();
  const { locations, isLoading: isLoadingLocations } = useLocations();

  const isLoading = isLoadingGroups || isLoadingUsers || isLoadingLocations;

  const form = useForm<z.infer<typeof surveySchema>>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      rating_type: initialData?.rating_type || 'numeric',
      scale_min: initialData?.scale_min || 1,
      scale_max: initialData?.scale_max || 5,
      thank_you_message: initialData?.thank_you_message || 'Thank you for your feedback!',
      follow_up_message:
        initialData?.follow_up_message || 'Is there anything else you would like to share?',
      assigned_users: initialData?.assigned_users || [],
      assigned_groups: initialData?.assigned_groups || [],
      assigned_locations: initialData?.assigned_locations || [],
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    console.log('Initial data changed:', initialData);
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description || '',
        rating_type: initialData.rating_type,
        scale_min: initialData.scale_min,
        scale_max: initialData.scale_max,
        thank_you_message: initialData.thank_you_message,
        follow_up_message: initialData.follow_up_message,
        assigned_users: initialData.assigned_users || [],
        assigned_groups: initialData.assigned_groups || [],
        assigned_locations: initialData.assigned_locations || [],
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: z.infer<typeof surveySchema>) => {
    try {
      console.log('Submitting template data:', data);

      if (initialData?.id) {
        console.log('Updating existing template:', initialData.id);
        const { error } = await supabase
          .from('survey_templates')
          .update([
            {
              ...data,
            },
          ])
          .eq('id', initialData.id);
        if (error) throw error;
      } else {
        console.log('Creating new template');
        const { error } = await supabase.from('survey_templates').insert([
          {
            ...data,
          },
        ]);
        if (error) throw error;
      }

      toast.success(`Template ${initialData ? 'updated' : 'created'} successfully`);
      onSuccess?.();
    } catch (error) {
      console.error('Template submission error:', error);
      toast.error('Failed to save template');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-foreground">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Name</FormLabel>
              <FormControl>
                <Input
                  className="bg-background text-foreground"
                  placeholder="Survey Template Name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Description</FormLabel>
              <FormControl>
                <Textarea
                  className="bg-background text-foreground"
                  placeholder="Describe the purpose of this survey template"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="rating_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Rating Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue placeholder="Select rating type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="numeric">Numeric</SelectItem>
                    <SelectItem value="stars">Stars</SelectItem>
                    <SelectItem value="emoji">Emoji</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="scale_min"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Min Scale</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-background text-foreground"
                      type="number"
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scale_max"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Max Scale</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-background text-foreground"
                      type="number"
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="thank_you_message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Thank You Message</FormLabel>
              <FormControl>
                <Input
                  className="bg-background text-foreground"
                  placeholder="Message to show after submission"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="follow_up_message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Follow-up Message</FormLabel>
              <FormControl>
                <Input
                  className="bg-background text-foreground"
                  placeholder="Additional feedback prompt"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="assigned_users"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Assigned Users</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={value => {
                      const currentValues = new Set(field.value);
                      currentValues.add(value);
                      field.onChange(Array.from(currentValues));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select users" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.first_name} {user.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                {field.value.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value.map(userId => {
                      const user = users.find(u => u.id === userId);
                      return user ? (
                        <div
                          key={userId}
                          className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm"
                        >
                          <span>
                            {user.first_name} {user.last_name}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              field.onChange(field.value.filter(id => id !== userId));
                            }}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            ×
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assigned_groups"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Assigned Groups</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={value => {
                      const currentValues = new Set(field.value);
                      currentValues.add(value);
                      field.onChange(Array.from(currentValues));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select groups" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map(group => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                {field.value.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value.map(groupId => {
                      const group = groups.find(g => g.id === groupId);
                      return group ? (
                        <div
                          key={groupId}
                          className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm"
                        >
                          <span>{group.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              field.onChange(field.value.filter(id => id !== groupId));
                            }}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            ×
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assigned_locations"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Assigned Locations</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={value => {
                      const currentValues = new Set(field.value);
                      currentValues.add(value);
                      field.onChange(Array.from(currentValues));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select locations" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                {field.value.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value.map(locationId => {
                      const location = locations.find(l => l.id === locationId);
                      return location ? (
                        <div
                          key={locationId}
                          className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm"
                        >
                          <span>{location.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              field.onChange(field.value.filter(id => id !== locationId));
                            }}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            ×
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Saving...
              </div>
            ) : (
              'Save Template'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
