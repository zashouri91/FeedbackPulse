import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as templatesApi from '@/lib/api/templates';
import { toast } from 'sonner';
import { useRealtimeSubscription } from './use-realtime';

export function useTemplates() {
  const queryClient = useQueryClient();

  const templatesQuery = useQuery({
    queryKey: ['templates'],
    queryFn: templatesApi.getTemplates,
  });

  // Set up real-time subscription
  useRealtimeSubscription({
    table: 'templates',
    onInsert: template => {
      queryClient.setQueryData(['templates'], (old: any[]) => [...old, template]);
    },
    onUpdate: template => {
      queryClient.setQueryData(['templates'], (old: any[]) =>
        old.map(t => (t.id === template.id ? template : t))
      );
    },
    onDelete: template => {
      queryClient.setQueryData(['templates'], (old: any[]) =>
        old.filter(t => t.id !== template.id)
      );
    },
  });

  const createTemplate = useMutation({
    mutationFn: templatesApi.createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template created successfully');
    },
    onError: () => {
      toast.error('Failed to create template');
    },
  });

  const updateTemplate = useMutation({
    mutationFn: ({ id, ...data }) => templatesApi.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template updated successfully');
    },
    onError: () => {
      toast.error('Failed to update template');
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: templatesApi.deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete template');
    },
  });

  return {
    templates: templatesQuery.data ?? [],
    isLoading: templatesQuery.isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
