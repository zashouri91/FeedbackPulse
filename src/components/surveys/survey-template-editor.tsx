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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useGroups } from '@/lib/hooks/use-groups';
import { useUsers } from '@/lib/hooks/use-users';
import { useLocations } from '@/lib/hooks/use-locations';
import { useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SurveyTemplateEditor({ onSuccess, initialData = null }) {
  const { groups } = useGroups();
  const { users } = useUsers();
  const { locations } = useLocations();

  const form = useForm({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      name: '',
      description: '',
      rating_type: 'numeric',
      scale_min: 1,
      scale_max: 5,
      thank_you_message: 'Thank you for your feedback!',
      follow_up_message: 'Is there anything else you would like to share?',
      assigned_users: [],
      assigned_groups: [],
      assigned_locations: [],
    },
  });

  useEffect(() => {
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

  const onSubmit = async (data) => {
    try {
      const templateData = {
        name: data.name,
        description: data.description,
        rating_type: data.rating_type,
        scale_min: data.scale_min,
        scale_max: data.scale_max,
        thank_you_message: data.thank_you_message,
        follow_up_message: data.follow_up_message,
        assigned_users: data.assigned_users || [],
        assigned_groups: data.assigned_groups || [],
        assigned_locations: data.assigned_locations || [],
      };

      if (initialData) {
        const { error } = await supabase
          .from('survey_templates')
          .update(templateData)
          .eq('id', initialData.id);
        
        if (error) throw error;
        toast.success('Template updated successfully');
      } else {
        const { error } = await supabase
          .from('survey_templates')
          .insert([templateData]);
        
        if (error) throw error;
        toast.success('Template created successfully');
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Name</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
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
                <FormLabel>Rating Type</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? field.value : "Select rating type"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search rating type..." />
                      <CommandEmpty>No rating type found.</CommandEmpty>
                      <CommandGroup>
                        {['numeric', 'stars', 'emoji'].map((type) => (
                          <CommandItem
                            value={type}
                            key={type}
                            onSelect={() => {
                              field.onChange(type);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === type ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {type}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
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
                  <FormLabel>Min Scale</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
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
                  <FormLabel>Max Scale</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
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
              <FormLabel>Thank You Message</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>Follow-up Message</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormItem className="flex flex-col">
                <FormLabel>Assign Users</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value?.length && "text-muted-foreground"
                        )}
                      >
                        {field.value?.length > 0
                          ? `${field.value.length} users selected`
                          : "Select users"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search users..." />
                      <CommandEmpty>No users found.</CommandEmpty>
                      <CommandGroup>
                        {users.map((user) => (
                          <CommandItem
                            value={user.id}
                            key={user.id}
                            onSelect={() => {
                              const values = field.value || [];
                              const newValues = values.includes(user.id)
                                ? values.filter((id) => id !== user.id)
                                : [...values, user.id];
                              field.onChange(newValues);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value?.includes(user.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {user.first_name} {user.last_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.value?.map((userId) => {
                    const user = users.find((u) => u.id === userId);
                    if (!user) return null;
                    return (
                      <Button
                        key={userId}
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          field.onChange(
                            field.value.filter((id) => id !== userId)
                          );
                        }}
                      >
                        {user.first_name} {user.last_name} ×
                      </Button>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assigned_groups"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Assign Groups</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value?.length && "text-muted-foreground"
                        )}
                      >
                        {field.value?.length > 0
                          ? `${field.value.length} groups selected`
                          : "Select groups"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search groups..." />
                      <CommandEmpty>No groups found.</CommandEmpty>
                      <CommandGroup>
                        {groups.map((group) => (
                          <CommandItem
                            value={group.id}
                            key={group.id}
                            onSelect={() => {
                              const values = field.value || [];
                              const newValues = values.includes(group.id)
                                ? values.filter((id) => id !== group.id)
                                : [...values, group.id];
                              field.onChange(newValues);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value?.includes(group.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {group.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.value?.map((groupId) => {
                    const group = groups.find((g) => g.id === groupId);
                    if (!group) return null;
                    return (
                      <Button
                        key={groupId}
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          field.onChange(
                            field.value.filter((id) => id !== groupId)
                          );
                        }}
                      >
                        {group.name} ×
                      </Button>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assigned_locations"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Assign Locations</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value?.length && "text-muted-foreground"
                        )}
                      >
                        {field.value?.length > 0
                          ? `${field.value.length} locations selected`
                          : "Select locations"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search locations..." />
                      <CommandEmpty>No locations found.</CommandEmpty>
                      <CommandGroup>
                        {locations.map((location) => (
                          <CommandItem
                            value={location.id}
                            key={location.id}
                            onSelect={() => {
                              const values = field.value || [];
                              const newValues = values.includes(location.id)
                                ? values.filter((id) => id !== location.id)
                                : [...values, location.id];
                              field.onChange(newValues);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value?.includes(location.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {location.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.value?.map((locationId) => {
                    const location = locations.find((l) => l.id === locationId);
                    if (!location) return null;
                    return (
                      <Button
                        key={locationId}
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          field.onChange(
                            field.value.filter((id) => id !== locationId)
                          );
                        }}
                      >
                        {location.name} ×
                      </Button>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit">
          {initialData ? 'Update Template' : 'Create Template'}
        </Button>
      </form>
    </Form>
  );
}
