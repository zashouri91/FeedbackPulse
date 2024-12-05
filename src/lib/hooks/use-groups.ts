import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useGroups() {
  const queryClient = useQueryClient();

  const groupsQuery = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const createGroup = useMutation({
    mutationFn: async (data: {
      name: string;
      manager_id: string;
      location_id: string;
    }) => {
      const { error } = await supabase
        .from('groups')
        .insert([data]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Group created successfully');
    },
    onError: () => {
      toast.error('Failed to create group');
    },
  });

  const updateGroup = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const { error } = await supabase
        .from('groups')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Group updated successfully');
    },
    onError: () => {
      toast.error('Failed to update group');
    },
  });

  const deleteGroup = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Group deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete group');
    },
  });

  return {
    groups: groupsQuery.data ?? [],
    isLoading: groupsQuery.isLoading,
    createGroup,
    updateGroup,
    deleteGroup,
  };
}