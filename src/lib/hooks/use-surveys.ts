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
      const { data, error } = await supabase.from('surveys').select('*, responses(*)');

      if (error) throw error;
      return data;
    },
  });

  const templatesQuery = useQuery({
    queryKey: ['survey_templates'],
    queryFn: async () => {
      console.log('Fetching templates...');
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

      if (error) {
        console.error('Error fetching templates:', error);
        throw error;
      }

      console.log('Templates fetched:', data);
      return data || [];
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
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
          // Force a refetch when any change occurs
          queryClient.invalidateQueries({ queryKey: ['survey_templates'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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

      if (error) {
        console.error('Error creating survey:', error);
        throw new Error(`Failed to create survey: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Survey created successfully');
    },
    onError: error => {
      console.error('Survey creation error:', error);
      toast.error(error.message);
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

      const { error } = await supabase.from('survey_templates').insert([templateData]);

      if (error) {
        console.error('Error creating template:', error);
        throw new Error(`Failed to create template: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survey_templates'] });
      toast.success('Template created successfully');
    },
    onError: error => {
      console.error('Template creation error:', error);
      toast.error(error.message);
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...data }: CreateTemplateData & { id: string }) => {
      // First, verify the template exists
      const { data: existing, error: fetchError } = await supabase
        .from('survey_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !existing) {
        console.error('Template not found:', id);
        throw new Error('Template not found');
      }

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

      if (error) {
        console.error('Error updating template:', error);
        throw error;
      }

      console.log('Template updated successfully:', updated);
      return updated;
    },
    onSuccess: updatedTemplate => {
      // Immediately update the cache
      queryClient.setQueryData(['survey_templates'], (old: any[]) => {
        if (!old) return [updatedTemplate];
        return old.map(t => (t.id === updatedTemplate.id ? updatedTemplate : t));
      });

      // Force a refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['survey_templates'] });
      toast.success('Template updated successfully');
    },
    onError: error => {
      console.error('Template update error:', error);
      toast.error('Failed to update template');
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting template:', id);

      // Delete the template
      const { error } = await supabase.from('survey_templates').delete().eq('id', id);

      if (error) {
        console.error('Error deleting template:', error);
        throw error;
      }

      console.log('Template deleted successfully:', id);
      return id;
    },
    onError: error => {
      console.error('Template deletion error:', error);
      toast.error('Failed to delete template');
    },
  });

  const submitResponse = useMutation({
    mutationFn: async (data: Omit<SurveyResponse, 'id' | 'created_at'>) => {
      const { error } = await supabase.from('survey_responses').insert([data]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survey_responses'] });
      toast.success('Response submitted successfully');
    },
    onError: () => {
      toast.error('Failed to submit response');
    },
  });

  const getTemplate = async (id: string) => {
    const { data, error } = await supabase
      .from('survey_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as SurveyTemplate;
  };

  return {
    surveys: surveysQuery.data ?? [],
    templates: templatesQuery.data ?? [],
    isLoading: surveysQuery.isLoading || templatesQuery.isLoading,
    createSurvey,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    submitResponse,
    getTemplate,
  };
}
