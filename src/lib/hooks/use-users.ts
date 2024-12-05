import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import * as api from '@/lib/api/users';

export function useUsers() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createUser = useMutation({
    mutationFn: api.createUser,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully', {
        description: `Temporary password: ${result.tempPassword}`,
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to create user', {
        description: error.message,
      });
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Parameters<typeof api.createUser>[0]) => {
      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update user', {
        description: error.message,
      });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete user', {
        description: error.message,
      });
    },
  });

  return {
    users,
    isLoading,
    createUser,
    updateUser,
    deleteUser,
  };
}