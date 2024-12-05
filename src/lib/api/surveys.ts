import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Survey = Database['public']['Tables']['surveys']['Row'];

export async function getSurveys() {
  const { data, error } = await supabase
    .from('surveys')
    .select('*, responses(*)')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as (Survey & { responses: any[] })[];
}

export async function createSurvey(data: {
  assignee_id: string;
  group_id: string;
  location_id: string;
}) {
  const { data: user } = await supabase.auth.getUser();
  const { error } = await supabase.from('surveys').insert([{
    ...data,
    creator_id: user?.user?.id,
  }]);
  
  if (error) throw error;
}

export async function getSurveyById(id: string) {
  const { data, error } = await supabase
    .from('surveys')
    .select('*, responses(*)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as (Survey & { responses: any[] });
}