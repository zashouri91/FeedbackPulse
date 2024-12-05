import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Response = Database['public']['Tables']['responses']['Row'];

export async function submitResponse(data: {
  survey_id: string;
  rating: number;
}) {
  const { error } = await supabase.from('responses').insert([{
    ...data,
    timestamp: new Date().toISOString(),
  }]);
  
  if (error) throw error;
}

export async function getResponsesBySurveyId(surveyId: string) {
  const { data, error } = await supabase
    .from('responses')
    .select('*')
    .eq('survey_id', surveyId)
    .order('timestamp', { ascending: false });
  
  if (error) throw error;
  return data as Response[];
}