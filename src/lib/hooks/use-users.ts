import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { toast } from 'sonner';
import * as api from '@/lib/api/users';

export function useUsers() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: api.getUsers,
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
    mutationFn: async ({ id, ...data }) => {
      return api.updateUser(id, data);
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
    mutationFn: api.deleteUser,
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