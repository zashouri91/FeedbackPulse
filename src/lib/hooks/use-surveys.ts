import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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
}

interface CreateTemplateData {
  name: string;
  description?: string;
  rating_type: 'numeric' | 'stars' | 'emoji';
  scale_min: number;
  scale_max: number;
  thank_you_message: string;
  follow_up_message: string;
  assigned_users?: string[];
  assigned_groups?: string[];
  assigned_locations?: string[];
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
      const { data, error } = await supabase
        .from('surveys')
        .select('*, responses(*)');
      
      if (error) throw error;
      return data;
    },
  });

  const templatesQuery = useQuery({
    queryKey: ['survey_templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('survey_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SurveyTemplate[];
    },
  });

  const createSurvey = useMutation({
    mutationFn: async (data: {
      assignee_id: string;
      group_id: string;
      location_id: string;
    }) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
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
    onError: (error) => {
      console.error('Survey creation error:', error);
      toast.error(error.message);
    },
  });

  const createTemplate = useMutation({
    mutationFn: async (data: CreateTemplateData) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error('Failed to get current user');
      if (!user) throw new Error('No authenticated user found');

      const templateData = {
        ...data,
        created_by: user.id,
        assigned_users: data.assigned_users || [],
        assigned_groups: data.assigned_groups || [],
        assigned_locations: data.assigned_locations || [],
      };

      const { error } = await supabase
        .from('survey_templates')
        .insert([templateData]);

      if (error) {
        console.error('Error creating template:', error);
        throw new Error(`Failed to create template: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survey_templates'] });
      toast.success('Template created successfully');
    },
    onError: (error) => {
      console.error('Template creation error:', error);
      toast.error(error.message);
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...data }: CreateTemplateData & { id: string }) => {
      const templateData = {
        ...data,
        assigned_users: data.assigned_users || [],
        assigned_groups: data.assigned_groups || [],
        assigned_locations: data.assigned_locations || [],
      };

      const { error } = await supabase
        .from('survey_templates')
        .update(templateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating template:', error);
        throw new Error(`Failed to update template: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survey_templates'] });
      toast.success('Template updated successfully');
    },
    onError: (error) => {
      console.error('Template update error:', error);
      toast.error(error.message);
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('survey_templates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting template:', error);
        throw new Error(`Failed to delete template: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survey_templates'] });
      toast.success('Template deleted successfully');
    },
    onError: (error) => {
      console.error('Template deletion error:', error);
      toast.error(error.message);
    },
  });

  const submitResponse = useMutation({
    mutationFn: async (data: Omit<SurveyResponse, 'id' | 'created_at'>) => {
      const { error } = await supabase
        .from('survey_responses')
        .insert([data]);

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