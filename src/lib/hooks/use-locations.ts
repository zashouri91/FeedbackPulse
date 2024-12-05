import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as api from '@/lib/api/locations';
import type { Database } from '@/types/supabase';

type Location = Database['public']['Tables']['locations']['Row'];

export function useLocations() {
  const queryClient = useQueryClient();

  const locationsQuery = useQuery({
    queryKey: ['locations'],
    queryFn: api.getLocations,
  });

  const createLocation = useMutation({
    mutationFn: api.createLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create location', {
        description: error.message,
      });
    },
  });

  const updateLocation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Location> & { id: string }) => {
      await api.updateLocation(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update location', {
        description: error.message,
      });
    },
  });

  const deleteLocation = useMutation({
    mutationFn: api.deleteLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete location', {
        description: error.message,
      });
    },
  });

  return {
    locations: locationsQuery.data ?? [],
    isLoading: locationsQuery.isLoading,
    createLocation,
    updateLocation,
    deleteLocation,
  };
}