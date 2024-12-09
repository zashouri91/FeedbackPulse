import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useEffect } from 'react';

interface ResponseDriver {
  id: string;
  name: string;
  description?: string;
  order_index: number;
}

interface SurveyTemplate {
  id: string;
  name: string;
  description?: string;
  rating_type: 'numeric' | 'stars' | 'emoji';
  scale_min: number;
  scale_max: number;
  thank_you_message: string;
  follow_up_message: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  assigned_users: string[];
  assigned_groups: string[];
  assigned_locations: string[];
  response_drivers: ResponseDriver[];
}

interface CreateTemplateData {
  name: string;
  description?: string;
  rating_type: 'numeric' | 'stars' | 'emoji';
  scale_min: number;
  scale_max: number;
  thank_you_message: string;
  follow_up_message: string;
  assigned_users: string[];
  assigned_groups: string[];
  assigned_locations: string[];
}

interface SurveyResponse {
  id: string;
  template_id: string;
  rating: number;
  selected_drivers: string[];
  respondent_email?: string;
  created_at: string;
}

export function useSurveys() {
  const queryClient = useQueryClient();

  const surveysQuery = useQuery({
    queryKey: ['surveys'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('surveys').select('*, responses(*)');
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching surveys:', error);
        throw new Error('Failed to fetch surveys. Please try again later.');
      }
    },
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  const templatesQuery = useQuery({
    queryKey: ['survey_templates'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('survey_templates')
          .select(
            `
            *,
            response_drivers (
              id,
              name,
              description,
              order_index
            )
          `
          )
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching templates:', error);
        throw new Error('Failed to fetch survey templates. Please try again later.');
      }
    },
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  useEffect(() => {
    const channel = supabase
      .channel('survey_templates_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'survey_templates',
        },
        payload => {
          console.log('Real-time update:', payload);
          queryClient.invalidateQueries({ queryKey: ['survey_templates'] });
          queryClient.invalidateQueries({ queryKey: ['surveys'] });
        }
      )
      .subscribe(status => {
        if (status !== 'SUBSCRIBED') {
          console.warn('Failed to subscribe to real-time updates:', status);
        }
      });

    return () => {
      channel.unsubscribe().catch(err => {
        console.warn('Error unsubscribing from real-time updates:', err);
      });
    };
  }, [queryClient]);

  const createSurvey = useMutation({
    mutationFn: async (data: { assignee_id: string; group_id: string; location_id: string }) => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw new Error('Failed to get current user');
      if (!user) throw new Error('No authenticated user found');

      const { error } = await supabase.from('surveys').insert([
        {
          ...data,
          creator_id: user.id,
        },
      ]);

      if (error) throw new Error(`Failed to create survey: ${error.message}`);
    },
    onMutate: async newSurvey => {
      await queryClient.cancelQueries({ queryKey: ['surveys'] });
      const previousSurveys = queryClient.getQueryData(['surveys']);
      queryClient.setQueryData(['surveys'], (old: any[] = []) => [...old, { ...newSurvey, id: 'temp-id' }]);
      return { previousSurveys };
    },
    onError: (err, newSurvey, context) => {
      if (context?.previousSurveys) {
        queryClient.setQueryData(['surveys'], context.previousSurveys);
      }
      toast.error('Failed to create survey');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    },
  });

  const createTemplate = useMutation({
    mutationFn: async (data: CreateTemplateData) => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw new Error('Failed to get current user');
      if (!user) throw new Error('No authenticated user found');

      const templateData = {
        ...data,
        created_by: user.id,
        assigned_users: data.assigned_users || [],
        assigned_groups: data.assigned_groups || [],
        assigned_locations: data.assigned_locations || [],
      };

      const { data: newTemplate, error } = await supabase
        .from('survey_templates')
        .insert([templateData])
        .select()
        .single();

      if (error) throw new Error(`Failed to create template: ${error.message}`);
      return newTemplate;
    },
    onMutate: async newTemplate => {
      await queryClient.cancelQueries({ queryKey: ['survey_templates'] });
      const previousTemplates = queryClient.getQueryData(['survey_templates']);
      queryClient.setQueryData(['survey_templates'], (old: any[] = []) => [
        { ...newTemplate, id: 'temp-id', created_at: new Date().toISOString() },
        ...old,
      ]);
      return { previousTemplates };
    },
    onError: (err, newTemplate, context) => {
      if (context?.previousTemplates) {
        queryClient.setQueryData(['survey_templates'], context.previousTemplates);
      }
      toast.error('Failed to create template');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['survey_templates'] });
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...data }: CreateTemplateData & { id: string }) => {
      const templateData = {
        ...data,
        assigned_users: data.assigned_users || [],
        assigned_groups: data.assigned_groups || [],
        assigned_locations: data.assigned_locations || [],
        updated_at: new Date().toISOString(),
      };

      const { data: updated, error } = await supabase
        .from('survey_templates')
        .update(templateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update template: ${error.message}`);
      return updated;
    },
    onMutate: async updatedTemplate => {
      await queryClient.cancelQueries({ queryKey: ['survey_templates'] });
      const previousTemplates = queryClient.getQueryData(['survey_templates']);
      queryClient.setQueryData(['survey_templates'], (old: any[] = []) =>
        old.map(t => (t.id === updatedTemplate.id ? { ...t, ...updatedTemplate } : t))
      );
      return { previousTemplates };
    },
    onError: (err, updatedTemplate, context) => {
      if (context?.previousTemplates) {
        queryClient.setQueryData(['survey_templates'], context.previousTemplates);
      }
      toast.error('Failed to update template');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['survey_templates'] });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('survey_templates').delete().eq('id', id);
      if (error) throw new Error(`Failed to delete template: ${error.message}`);
      return id;
    },
    onMutate: async deletedId => {
      await queryClient.cancelQueries({ queryKey: ['survey_templates'] });
      const previousTemplates = queryClient.getQueryData(['survey_templates']);
      queryClient.setQueryData(['survey_templates'], (old: any[] = []) =>
        old.filter(t => t.id !== deletedId)
      );
      return { previousTemplates };
    },
    onError: (err, deletedId, context) => {
      if (context?.previousTemplates) {
        queryClient.setQueryData(['survey_templates'], context.previousTemplates);
      }
      toast.error('Failed to delete template');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['survey_templates'] });
    },
  });

  const submitResponse = useMutation({
    mutationFn: async (data: Omit<SurveyResponse, 'id' | 'created_at'>) => {
      const { error } = await supabase.from('survey_responses').insert([data]);
      if (error) throw new Error(`Failed to submit response: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survey_responses'] });
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Response submitted successfully');
    },
    onError: () => {
      toast.error('Failed to submit response');
    },
  });

  const getTemplate = async (id: string) => {
    const cachedTemplates = queryClient.getQueryData<SurveyTemplate[]>(['survey_templates']);
    const cachedTemplate = cachedTemplates?.find(t => t.id === id);
    if (cachedTemplate) return cachedTemplate;

    const { data, error } = await supabase
      .from('survey_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Failed to fetch template: ${error.message}`);
    return data as SurveyTemplate;
  };

  return {
    surveys: surveysQuery.data ?? [],
    templates: templatesQuery.data ?? [],
    isLoading: surveysQuery.isLoading || templatesQuery.isLoading,
    isError: surveysQuery.isError || templatesQuery.isError,
    error: surveysQuery.error || templatesQuery.error,
    createSurvey,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    submitResponse,
    getTemplate,
    refetch: () => {
      surveysQuery.refetch();
      templatesQuery.refetch();
    },
  };
}
