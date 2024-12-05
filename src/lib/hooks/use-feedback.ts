import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useSubmitFeedback() {
  const submitFeedback = useMutation({
    mutationFn: async (data: { survey_id: string; rating: number }) => {
      const { error } = await supabase.from('responses').insert([
        {
          survey_id: data.survey_id,
          rating: data.rating,
          timestamp: new Date().toISOString(),
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Thank you for your feedback!');
    },
    onError: () => {
      toast.error('Failed to submit feedback. Please try again.');
    },
  });

  return {
    submitFeedback,
    isPending: submitFeedback.isPending,
  };
}