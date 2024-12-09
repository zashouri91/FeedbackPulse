import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { SurveyTemplate, SurveyResponse, ResponseDriver, Analytics } from '../types';

export function useEnhancedSurveys() {
  const queryClient = useQueryClient();

  // Fetch templates with assignments
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['survey-templates'],
    queryFn: async () => {
      const { data, error } = await supabase.from('survey_templates').select(`
          *,
          response_drivers (*)
        `);
      if (error) throw error;
      return data as (SurveyTemplate & { response_drivers: ResponseDriver[] })[];
    },
  });

  // Generate email signature
  const generateSignature = async (templateId: string, userId: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (!template) throw new Error('Template not found');

    // Get user details
    const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();

    if (!user) throw new Error('User not found');

    // Generate unique tracking ID
    const trackingId = btoa(`${templateId}:${userId}:${Date.now()}`);

    // Generate HTML signature
    const signature = `
      <div class="feedback-signature" style="font-family: Arial, sans-serif; max-width: 600px; padding: 15px; border-top: 1px solid #eee; margin-top: 15px;" data-tracking="${trackingId}">
        <div class="user-info" style="margin-bottom: 15px;">
          <div style="font-size: 16px; font-weight: 600; color: #333;">${user.first_name} ${user.last_name}</div>
          ${user.title ? `<div style="font-size: 14px; color: #666; margin-top: 4px;">${user.title}</div>` : ''}
          ${user.phone ? `<div style="font-size: 14px; color: #666; margin-top: 4px;">${user.phone}</div>` : ''}
          ${user.email ? `<div style="font-size: 14px; color: #666; margin-top: 4px;"><a href="mailto:${user.email}" style="color: #0066cc; text-decoration: none;">${user.email}</a></div>` : ''}
        </div>
        <div class="feedback-prompt" style="margin-top: 15px;">
          <p style="font-size: 14px; color: #444; margin: 0 0 10px 0;">How was your experience?</p>
          <div style="display: flex; gap: 8px; align-items: center;">
            ${generateRatingHTML(template.rating_type, template.scale_min, template.scale_max)}
          </div>
        </div>
      </div>
    `;

    return { signature, trackingId };
  };

  // Submit survey response
  const { mutate: submitResponse } = useMutation({
    mutationFn: async ({
      templateId,
      userId,
      rating,
      feedback,
      drivers,
    }: {
      templateId: string;
      userId: string;
      rating: number;
      feedback?: string;
      drivers?: string[];
    }) => {
      const { data, error } = await supabase
        .from('survey_responses')
        .insert({
          template_id: templateId,
          user_id: userId,
          rating,
          feedback,
          selected_drivers: drivers,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survey-responses'] });
    },
  });

  // Get analytics
  const getAnalytics = async (filters: Analytics['filters']): Promise<Analytics['metrics']> => {
    const { data, error } = await supabase.rpc('get_survey_analytics', filters);

    if (error) throw error;
    return data;
  };

  return {
    templates,
    templatesLoading,
    generateSignature,
    submitResponse,
    getAnalytics,
  };
}

// Helper function to generate rating HTML based on type
function generateRatingHTML(type: SurveyTemplate['rating_type'], min: number, max: number) {
  const baseButtonStyle = `
    cursor: pointer;
    border: none;
    background: none;
    padding: 8px;
    font-size: 20px;
    transition: transform 0.2s;
    text-decoration: none;
  `.trim();

  switch (type) {
    case 'numeric':
      return Array.from({ length: max - min + 1 }, (_, i) => i + min)
        .map(
          n => `
          <button 
            class="rating-btn numeric" 
            data-rating="${n}" 
            style="${baseButtonStyle}; color: #666; width: 36px; height: 36px; border-radius: 50%; background: #f5f5f5;"
          >
            ${n}
          </button>
        `
        )
        .join('');
    case 'stars':
      return Array.from({ length: max }, (_, i) => i + 1)
        .map(
          n => `
          <button 
            class="rating-btn star" 
            data-rating="${n}" 
            style="${baseButtonStyle}; color: #ffd700;"
          >
            ⭐
          </button>
        `
        )
        .join('');
    case 'emoji':
      const emojis = ['😡', '😕', '😐', '🙂', '😊'];
      return emojis
        .map(
          (emoji, i) => `
          <button 
            class="rating-btn emoji" 
            data-rating="${i + 1}" 
            style="${baseButtonStyle};"
          >
            ${emoji}
          </button>
        `
        )
        .join('');
  }
}
