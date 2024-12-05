import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useSurveys() {
  const queryClient = useQueryClient();

  const surveysQuery = useQuery({
    queryKey: ['surveys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('surveys')
        .select('*, responses(*)');
      
      if (error) throw error;
      return data;
    },
  });

  const createSurvey = useMutation({
    mutationFn: async (data: {
      assignee_id: string;
      group_id: string;
      location_id: string;
    }) => {
      const { error } = await supabase.from('surveys').insert([
        {
          ...data,
          creator_id: (await supabase.auth.getUser()).data.user?.id,
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Survey created successfully');
    },
    onError: () => {
      toast.error('Failed to create survey');
    },
  });

  return {
    surveys: surveysQuery.data ?? [],
    isLoading: surveysQuery.isLoading,
    createSurvey,
  };
}